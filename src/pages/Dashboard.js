// Dashboard page with analytics and overview

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ImageIcon, 
  Users, 
  TrendingUp, 
  Upload, 
  Palette,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';

import { dashboardAPI, galleryAPI, handleApiError } from '../services/api';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RecentActivity = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  background: rgba(102, 126, 234, 0.05);
`;

const ActivityImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #333;
`;

const ActivityMeta = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: white;
  font-size: 1.125rem;
`;

const Dashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(null);
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsData, recentData] = await Promise.all([
        dashboardAPI.getMetrics(),
        galleryAPI.getRecentArtworks(5)
      ]);

      setMetrics(metricsData);
      setRecentArtworks(recentData);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to load dashboard: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>Loading dashboard...</LoadingSpinner>
      </DashboardContainer>
    );
  }

  // Prepare chart data
  const styleDistributionData = metrics?.style_distribution ? 
    Object.entries(metrics.style_distribution).map(([style, count]) => ({
      name: style.charAt(0).toUpperCase() + style.slice(1),
      value: count
    })) : [];

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];

  return (
    <DashboardContainer>
      <Title>Dashboard Overview</Title>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#667eea">
              <ImageIcon size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{metrics?.total_artworks || 0}</StatValue>
          <StatLabel>Total Artworks</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#764ba2">
              <Users size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{metrics?.total_users || 0}</StatValue>
          <StatLabel>Active Artists</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f093fb">
              <TrendingUp size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{((metrics?.classification_accuracy || 0) * 100).toFixed(1)}%</StatValue>
          <StatLabel>ML Accuracy</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f5576c">
              <Palette size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{Object.keys(metrics?.style_distribution || {}).length}</StatValue>
          <StatLabel>Art Styles</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Art Style Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={styleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {styleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Style Popularity</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={styleDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentActivity>
        <ChartTitle>Recent Artwork Uploads</ChartTitle>
        {recentArtworks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No recent artworks. <a href="/upload" style={{ color: '#667eea' }}>Upload the first one!</a>
          </div>
        ) : (
          recentArtworks.map((artwork) => (
            <ActivityItem key={artwork.id}>
              <ActivityImage 
                src={`http://localhost:8000/${artwork.file_path}`} 
                alt={artwork.title}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0yNSAyMEMxNy4yNjggMjAgMTEgMjYuMjY4IDExIDM0QzExIDQxLjczMiAxNy4yNjggNDggMjUgNDhDMzIuNzMyIDQ4IDM5IDQxLjczMiAzOSAzNEMzOSAyNi4yNjggMzIuNzMyIDIwIDI1IDIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />
              <ActivityDetails>
                <ActivityTitle>{artwork.title}</ActivityTitle>
                <ActivityMeta>
                  {artwork.predicted_style ? 
                    `Style: ${artwork.predicted_style} (${(artwork.confidence_score * 100).toFixed(1)}% confidence)` : 
                    'Style: Not classified yet'
                  }
                </ActivityMeta>
                <ActivityMeta>
                  Uploaded {new Date(artwork.created_at).toLocaleDateString()}
                </ActivityMeta>
              </ActivityDetails>
            </ActivityItem>
          ))
        )}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;
