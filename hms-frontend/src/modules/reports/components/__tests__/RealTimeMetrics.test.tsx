import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealTimeMetrics } from '../RealTimeMetrics';

// Mock the reportsApi
jest.mock('../../../services/reportsApi', () => ({
  reportsApi: {
    getDashboardMetrics: jest.fn(),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('RealTimeMetrics', () => {
  it('renders loading state', () => {
    renderWithQueryClient(<RealTimeMetrics />);
    expect(screen.getByText('Loading real-time metrics...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    // Mock error state
    const mockQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={mockQueryClient}>
        <RealTimeMetrics />
      </QueryClientProvider>
    );
    
    // The component should handle the error gracefully
    expect(screen.getByText('Failed to load metrics')).toBeInTheDocument();
  });

  it('renders metrics when data is available', () => {
    const mockMetrics = {
      summary: {
        totalPatients: 100,
        totalAmount: 50000,
        totalUsers: 25,
        totalBills: 200,
      },
    };

    // Mock successful data
    const mockQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={mockQueryClient}>
        <RealTimeMetrics />
      </QueryClientProvider>
    );

    // Should show the metrics data
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('handles undefined metrics gracefully', () => {
    renderWithQueryClient(<RealTimeMetrics />);
    
    // Should show fallback message when metrics are undefined
    expect(screen.getByText('Metrics data not available')).toBeInTheDocument();
  });
});
