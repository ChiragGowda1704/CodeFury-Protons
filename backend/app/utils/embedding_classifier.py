"""
Embedding-based classifier that uses a pre-trained CNN (MobileNetV2) to
compute feature vectors for all images in the local dataset and classifies
an input by nearest-neighbor similarity. This is robust and requires no
training, and it strictly classifies into classes present in the dataset.
"""

from __future__ import annotations

import os
import io
import json
import time
from typing import Dict, List, Tuple

import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras.applications import mobilenet_v2
    from tensorflow.keras.preprocessing import image as keras_image
    TF_AVAILABLE = True
except Exception as e:  # pragma: no cover
    TF_AVAILABLE = False
    _TF_IMPORT_ERROR = str(e)

try:
    import cv2  # type: ignore
    CV2_AVAILABLE = True
except Exception:
    CV2_AVAILABLE = False

from PIL import Image


DATASET_DIR_DEFAULT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets", "art_classification")
)
INDEX_DIR_DEFAULT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
)
INDEX_FILE_TF = os.path.join(INDEX_DIR_DEFAULT, "dataset_index_tf.npz")
INDEX_FILE_CV = os.path.join(INDEX_DIR_DEFAULT, "dataset_index_cv.npz")
META_FILE = os.path.join(INDEX_DIR_DEFAULT, "dataset_index.meta.json")


def _normalize_label(name: str) -> str:
    n = name.strip().lower()
    # Map common folder names to canonical labels
    if "madhubani" in n:
        return "madhubani"
    if "warli" in n:
        return "warli"
    if "pithora" in n or "pithori" in n:
        return "pithora"
    # fallback: use last token
    return n.replace("_", " ")


class EmbeddingClassifier:
    def __init__(self, dataset_dir: str = DATASET_DIR_DEFAULT):
        self.dataset_dir = dataset_dir
        # Choose index file based on method
        self.method = "mobilenetv2" if TF_AVAILABLE else "cvhsv"
        self.index_file = INDEX_FILE_TF if TF_AVAILABLE else INDEX_FILE_CV
        self.meta_file = META_FILE
        self.model = None
        self.labels: List[str] = []
        self.embeddings: np.ndarray | None = None
        self.label_names: List[str] = []
        self.class_to_indices: Dict[str, List[int]] = {}
        self.loaded = False

        try:
            self._load_or_build_index()
        except Exception as e:  # pragma: no cover
            print(f"⚠️ Embedding index load/build failed: {e}")
            if not TF_AVAILABLE and not CV2_AVAILABLE:
                print("❌ Neither TensorFlow nor OpenCV available for EmbeddingClassifier")

    def _get_model(self):
        if not TF_AVAILABLE:
            return None
        if self.model is None:
            base = mobilenet_v2.MobileNetV2(include_top=False, weights='imagenet', pooling='avg')
            self.model = base
        return self.model

    def _preprocess_pil(self, img: Image.Image) -> np.ndarray:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((224, 224))
        x = keras_image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = mobilenet_v2.preprocess_input(x)
        return x

    def _embed_image(self, pil_img: Image.Image) -> np.ndarray:
        """Compute an embedding vector for an image using the selected method.
        - If TF available: MobileNetV2 global features
        - Else: HSV color histogram + edge histogram (CV2 or numpy fallback)
        """
        if TF_AVAILABLE:
            model = self._get_model()
            x = self._preprocess_pil(pil_img)
            feat = model.predict(x, verbose=0)[0]
            # L2 normalize
            norm = np.linalg.norm(feat) + 1e-9
            return feat / norm
        # CV/numpy feature embedding
        return self._compute_cv_features(pil_img)

    def _compute_cv_features(self, pil_img: Image.Image) -> np.ndarray:
        """Compute a robust, lightweight feature vector using HSV histogram and edge histogram.
        Returns an L2-normalized vector.
        """
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')
        # Resize to speed up
        pil_img_small = pil_img.resize((256, 256))
        arr = np.array(pil_img_small)

        # HSV histogram (8x8x8)
        if CV2_AVAILABLE:
            hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
            hist = cv2.calcHist([hsv], [0, 1, 2], None, [8, 8, 8], [0, 180, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            # Edge histogram using Sobel magnitude
            gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
            gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
            gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
            mag = cv2.magnitude(gx, gy)
            # 16-bin histogram of edge magnitudes
            edge_hist, _ = np.histogram(mag, bins=16, range=(0, max(1.0, float(mag.max()))))
            edge_hist = edge_hist.astype(np.float32)
            if edge_hist.sum() > 0:
                edge_hist /= edge_hist.sum()
        else:
            # PIL/numpy fallback
            # Approximate HSV via conversion
            arr = arr.astype(np.float32) / 255.0
            r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
            maxc = arr.max(-1)
            minc = arr.min(-1)
            v = maxc
            s = (maxc - minc) / (maxc + 1e-6)
            rc = (maxc - r) / (maxc - minc + 1e-6)
            gc = (maxc - g) / (maxc - minc + 1e-6)
            bc = (maxc - b) / (maxc - minc + 1e-6)
            h = (4.0 + gc - rc) / 6.0
            h = np.where(maxc == r, (bc - gc) / 6.0, h)
            h = np.where(maxc == g, (2.0 + rc - bc) / 6.0, h)
            h = (h % 1.0) * 180.0
            hsv = np.stack([h, s * 255.0, v * 255.0], axis=-1).astype(np.float32)
            # Histogram
            hist, _ = np.histogramdd(hsv.reshape(-1, 3), bins=(8, 8, 8), range=((0, 180), (0, 256), (0, 256)))
            hist = hist / (hist.sum() + 1e-6)
            hist = hist.flatten().astype(np.float32)
            # Edge via numpy gradients
            gray = (0.299 * r + 0.587 * g + 0.114 * b)
            gx = np.gradient(gray, axis=1)
            gy = np.gradient(gray, axis=0)
            mag = np.sqrt(gx * gx + gy * gy)
            edge_hist, _ = np.histogram(mag, bins=16, range=(0, float(mag.max() + 1e-6)))
            edge_hist = edge_hist.astype(np.float32)
            if edge_hist.sum() > 0:
                edge_hist /= edge_hist.sum()

        feat = np.concatenate([hist.astype(np.float32), edge_hist.astype(np.float32)])
        # L2 normalize
        norm = np.linalg.norm(feat) + 1e-9
        return feat / norm

    def _iter_dataset_images(self) -> List[Tuple[str, str]]:
        pairs = []
        if not os.path.isdir(self.dataset_dir):
            return pairs
        for root, dirs, files in os.walk(self.dataset_dir):
            # class folder = last component of root under dataset_dir
            rel = os.path.relpath(root, self.dataset_dir)
            if rel == '.' or rel.startswith('.'):
                # skip the top-level itself
                pass
            else:
                label = _normalize_label(os.path.basename(root))
                for f in files:
                    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                        pairs.append((label, os.path.join(root, f)))
        return pairs

    def _load_or_build_index(self, max_per_class: int = 400):
        os.makedirs(INDEX_DIR_DEFAULT, exist_ok=True)
        if os.path.exists(self.index_file) and os.path.exists(self.meta_file):
            try:
                data = np.load(self.index_file)
                self.embeddings = data['embeddings']
                self.labels = data['labels'].tolist()
                with open(self.meta_file, 'r') as f:
                    meta = json.load(f)
                # If method changed, force rebuild
                if meta.get('method') != self.method:
                    raise RuntimeError(f"Index method mismatch: {meta.get('method')} != {self.method}")
                self.label_names = meta.get('label_names', sorted(set(self.labels)))
                self._rebuild_class_indices()
                self.loaded = True
                print(f"✅ Loaded embedding index ({self.method}): {self.embeddings.shape} vectors across {len(set(self.labels))} classes")
                return
            except Exception as e:
                print(f"⚠️ Failed to load existing index, rebuilding. Reason: {e}")

        # Build index
        print(f"🏗️ Building embedding index from dataset using method={self.method}...")
        items = self._iter_dataset_images()
        if not items:
            raise RuntimeError(f"Dataset directory empty or missing: {self.dataset_dir}")

        # Cap per class
        by_class: Dict[str, List[str]] = {}
        for label, path in items:
            by_class.setdefault(label, []).append(path)

        embeddings: List[np.ndarray] = []
        labels: List[str] = []
        for label, paths in by_class.items():
            count = 0
            for p in paths:
                if count >= max_per_class:
                    break
                try:
                    with Image.open(p) as img:
                        emb = self._embed_image(img)
                    embeddings.append(emb)
                    labels.append(label)
                    count += 1
                except Exception:
                    continue

        if not embeddings:
            raise RuntimeError("No embeddings created from dataset")

        self.embeddings = np.vstack(embeddings)
        self.labels = labels
        self.label_names = sorted(set(labels))
        self._rebuild_class_indices()

        # Save
        np.savez(self.index_file, embeddings=self.embeddings, labels=np.array(self.labels, dtype=object))
        with open(self.meta_file, 'w') as f:
            json.dump({
                'label_names': self.label_names,
                'dataset_dir': self.dataset_dir,
                'built_at': int(time.time()),
                'count': int(self.embeddings.shape[0]),
                'method': self.method,
            }, f)
        self.loaded = True
        print(f"✅ Built embedding index ({self.method}) with {self.embeddings.shape[0]} vectors across {len(self.label_names)} classes")

    def _rebuild_class_indices(self):
        self.class_to_indices = {}
        for idx, lab in enumerate(self.labels):
            self.class_to_indices.setdefault(lab, []).append(idx)

    def classify(self, image_bytes: bytes, top_k: int = 3) -> Dict:
        if not TF_AVAILABLE and not CV2_AVAILABLE:
            raise RuntimeError("Embedding classifier requires TensorFlow or OpenCV")
        if not self.loaded or self.embeddings is None:
            self._load_or_build_index()
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        emb = self._embed_image(img)

        # Compute per-class centroids to mitigate imbalance and noise
        labs = sorted(set(self.labels))
        centroids = []
        for lab in labs:
            idxs = self.class_to_indices.get(lab, [])
            if not idxs:
                centroids.append(np.zeros_like(self.embeddings[0]))
            else:
                c = self.embeddings[idxs].mean(axis=0)
                c = c / (np.linalg.norm(c) + 1e-9)
                centroids.append(c)
        centroids = np.vstack(centroids)

        # Cosine similarity to each class centroid
        logits = (centroids @ emb)
        # Temperature scaling to spread probabilities a bit
        temp = 0.05
        exps = np.exp((logits - logits.max()) / temp)
        probs = exps / exps.sum()

        # Pick best
        best_idx = int(np.argmax(probs))
        predicted = labs[best_idx]
        confidence = float(probs[best_idx])

        # Build distribution over canonical label order
        all_predictions = {lab: float(prob) for lab, prob in zip(labs, probs)}

        return {
            'predicted_style': predicted,
            'confidence_score': confidence,
            'all_predictions': all_predictions,
            'method': 'mobilenetv2-embeddings-knn' if TF_AVAILABLE else 'cvhsv-embeddings-knn',
        }


# Singleton accessor
_singleton: EmbeddingClassifier | None = None


def get_embedding_classifier(dataset_dir: str = DATASET_DIR_DEFAULT) -> EmbeddingClassifier:
    global _singleton
    if _singleton is None:
        _singleton = EmbeddingClassifier(dataset_dir)
    return _singleton
