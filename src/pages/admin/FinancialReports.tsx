import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const FinancialReports: React.FC = () => {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 19000, 15000, 22000, 18000, 25000],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expenses ($)',
        data: [8000, 12000, 10000, 15000, 13000, 16000],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ],
  };

  const lineData = {
    labels: ['1st', '5th', '10th', '15th', '20th', '25th', '30th'],
    datasets: [
      {
        label: 'Daily Sales - Current Month',
        data: [600, 800, 750, 1200, 950, 1100, 1300],
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a1a1aa' }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a1a1aa' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a1a1aa' } }
    }
  };

  return (
    <div className="animate-fade-in reports-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Financial Reports</h2>
        <div className="d-flex gap-2">
          <Form.Select className="bg-dark text-light border-secondary">
            <option>Daily</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </Form.Select>
          <Button variant="primary" className="text-nowrap">Export PDF</Button>
        </div>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex flex-column p-4">
              <h5 className="mb-4">Monthly Revenue vs Expenses</h5>
              <div style={{ minHeight: '300px', flex: 1 }}>
                <Bar data={barData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex flex-column p-4">
              <h5 className="mb-4">Daily Sales Trend</h5>
              <div style={{ minHeight: '300px', flex: 1 }}>
                <Line data={lineData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
