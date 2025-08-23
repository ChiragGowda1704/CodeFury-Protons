import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div` padding:2rem; max-width:1000px; margin:0 auto; `;
const Card = styled.div` background:rgba(255,255,255,0.95); padding:2rem; border-radius:16px; `;
const Section = styled.div` margin-bottom:1.5rem; `;
const Title = styled.h2` margin:0 0 1rem; color:#333; `;
const List = styled.ul` margin:0; padding-left:1.25rem; color:#444; `;
const ChecklistItem = styled.label` display:flex; gap:.5rem; align-items:flex-start; margin:.5rem 0; `;
const Button = styled.button` background:linear-gradient(135deg,#10b981,#14b8a6); color:#fff; border:none; padding:.6rem 1rem; border-radius:10px; cursor:pointer; `;

export default function ExportCompliance() {
  const [checks, setChecks] = useState({
    materials: false,
    labeling: false,
    packaging: false,
    fumigation: false,
    certificates: false,
    pricing: false,
    logistics: false,
    ip: false,
  });

  const toggle = (k) => setChecks((c)=>({ ...c, [k]: !c[k] }));

  const readyScore = Object.values(checks).reduce((a,b)=>a+(b?1:0),0);

  return (
    <Container>
      <Card>
        <Title>Export Compliance: Make Your Handicrafts Export Ready</Title>

        <Section>
          <p style={{color:'#555'}}>Follow this checklist to meet common international standards for handicraft exports. This is guidance only; confirm requirements with your importer and local export authority.</p>
        </Section>

        <Section>
          <h3>Checklist</h3>
          <ChecklistItem><input type="checkbox" checked={checks.materials} onChange={()=>toggle('materials')} /> Ensure materials comply with destination regulations (no restricted wildlife/plant parts, safe dyes/finishes).</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.labeling} onChange={()=>toggle('labeling')} /> Proper labeling: country of origin, materials, care instructions, and HS code suggestion.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.packaging} onChange={()=>toggle('packaging')} /> Export-grade packaging: moisture/impact protection; recyclable materials where possible.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.fumigation} onChange={()=>toggle('fumigation')} /> For wooden items: fumigation/ISPM-15 compliant pallets and declaration.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.certificates} onChange={()=>toggle('certificates')} /> Certificates as required: FSC (wood), azo-free dyes, eco-friendly declarations, artisan provenance.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.pricing} onChange={()=>toggle('pricing')} /> Export pricing: include packaging, insurance, freight (Incoterms), duties estimates.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.logistics} onChange={()=>toggle('logistics')} /> Logistics plan: HS code, Incoterms, courier/freight forwarder, delivery timelines.</ChecklistItem>
          <ChecklistItem><input type="checkbox" checked={checks.ip} onChange={()=>toggle('ip')} /> IP and cultural rights: obtain consent for protected motifs; avoid trademarked designs.</ChecklistItem>
        </Section>

        <Section>
          <h3>Resources</h3>
          <List>
            <li>DGFT/Export Promotion Council guidelines for handicrafts.</li>
            <li>Destination country customs website for restricted materials.</li>
            <li>Incoterms 2020 reference for shipping terms (EXW, FOB, CIF, DDP).</li>
            <li>Local testing labs for azo-free, lead-free, and safety certificates.</li>
          </List>
        </Section>

        <Section>
          <p><strong>Readiness Score:</strong> {readyScore}/8</p>
          <Button onClick={()=>window.print()}>Print/Save Checklist</Button>
        </Section>
      </Card>
    </Container>
  );
}
