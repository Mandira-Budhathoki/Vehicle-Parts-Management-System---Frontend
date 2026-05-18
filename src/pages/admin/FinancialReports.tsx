import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { reportsApi, type FinancialReport } from '../../services/ReportsApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const FinancialReports: React.FC = () => {
  const [period, setPeriod] = useState<string>('monthly');
  const [referenceDate, setReferenceDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // default to monthly YYYY-MM
  });
  
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch report when period or reference date changes
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        let apiDate = referenceDate;
        // Adjust default formatting before sending to API
        if (period === 'yearly' && referenceDate.length > 4) {
          apiDate = referenceDate.substring(0, 4);
        } else if (period === 'daily' && referenceDate.length === 7) {
          // If toggled to daily from monthly, append first day of month
          apiDate = `${referenceDate}-01`;
          setReferenceDate(apiDate);
        }
        
        const data = await reportsApi.getFinancialReport(period, apiDate);
        setReport(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch financial report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [period, referenceDate]);

  // Handle changing the period and resetting the default date selector values
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPeriod = e.target.value;
    setPeriod(nextPeriod);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    if (nextPeriod === 'daily') {
      setReferenceDate(`${year}-${month}-${day}`);
    } else if (nextPeriod === 'yearly') {
      setReferenceDate(`${year}`);
    } else {
      setReferenceDate(`${year}-${month}`);
    }
  };

  // Configure Chart JS data
  const labels = report?.breakdown.map((item) => item.label) || [];
  const revenueData = report?.breakdown.map((item) => item.revenue) || [];
  const expensesData = report?.breakdown.map((item) => item.expenses) || [];
  const profitData = report?.breakdown.map((item) => item.profit) || [];

  const barData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Expenses ($)',
        data: expensesData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const trendData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Net Profit ($)',
        data: profitData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: 'rgb(16, 185, 129)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a1a1aa', font: { family: 'Inter, sans-serif' } }
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
        borderWidth: 1,
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(0,0,0,0.05)' }, 
        ticks: { color: '#a1a1aa', callback: (val: any) => `$${val}` } 
      },
      x: { 
        grid: { color: 'rgba(0,0,0,0.05)' }, 
        ticks: { color: '#a1a1aa' } 
      }
    }
  };

  // Export dynamically rendered report as PDF
  const handleExportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    
    // Robust helper to invoke jspdf-autotable across different module resolution systems
    const renderTable = (headers: any, data: any, startY: number, headerColor: number[]) => {
      const options = {
        startY,
        head: headers,
        body: data,
        headStyles: { fillColor: headerColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 3.5 }
      };

      if (typeof autoTable === 'function') {
        autoTable(doc, options);
      } else if (autoTable && (autoTable as any).default && typeof (autoTable as any).default === 'function') {
        (autoTable as any).default(doc, options);
      } else if ((doc as any).autoTable) {
        (doc as any).autoTable(options);
      }
    };

    const periodName = period.toUpperCase();
    const formattedDate = new Date(report.referenceDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: period === 'yearly' ? undefined : 'long',
      day: period === 'daily' ? 'numeric' : undefined
    });

    // Branded Cover/Header bar
    doc.setFillColor(31, 41, 55); // #1f2937 (Slate-800)
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('VEHICLE PARTS MANAGEMENT SYSTEM', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(165, 180, 252); // Indigo-200
    doc.text(`FINANCIAL AUDIT REPORT — ${periodName} PERIOD`, 15, 28);
    doc.text(`Reference Frame: ${period === 'yearly' ? report.referenceDate.substring(0, 4) : formattedDate}`, 15, 34);
    
    doc.setFontSize(9);
    doc.setTextColor(209, 213, 219); // Gray-300
    doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 34);

    // Section 1: Financial Summaries
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('1. CONSOLIDATED FINANCIAL METRICS', 15, 52);

    const cardWidth = 58;
    const cardHeight = 24;
    const yStart = 58;

    // Card 1: Revenue
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, yStart, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(15, yStart, cardWidth, cardHeight, 2, 2, 'D');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('TOTAL REVENUE', 20, yStart + 8);
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`$${report.totalRevenue.toFixed(2)}`, 20, yStart + 18);

    // Card 2: Expenses
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15 + cardWidth + 5, yStart, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(15 + cardWidth + 5, yStart, cardWidth, cardHeight, 2, 2, 'D');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('TOTAL EXPENSES', 15 + cardWidth + 10, yStart + 8);
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`$${report.totalExpenses.toFixed(2)}`, 15 + cardWidth + 10, yStart + 18);

    // Card 3: Net Profit
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15 + (cardWidth + 5) * 2, yStart, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(15 + (cardWidth + 5) * 2, yStart, cardWidth, cardHeight, 2, 2, 'D');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('NET PROFIT', 15 + (cardWidth + 5) * 2 + 5, yStart + 8);
    doc.setFontSize(13);
    if (report.netProfit >= 0) {
      doc.setTextColor(5, 150, 105); // emerald-600
    } else {
      doc.setTextColor(220, 38, 38); // red-600
    }
    doc.text(`$${report.netProfit.toFixed(2)}`, 15 + (cardWidth + 5) * 2 + 5, yStart + 18);

    // Context Stats
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Sales Orders Placed: ${report.totalSalesCount}`, 15, yStart + 32);
    doc.text(`Vendor Purchases Logged: ${report.totalPurchasesCount}`, 115, yStart + 32);

    // Section 2: Top Selling Parts Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text('2. TOP SELLING PARTS BREAKDOWN', 15, yStart + 46);

    const partsHeaders = [['Rank', 'Part Name', 'Category', 'Quantity Sold', 'Revenue Generated']];
    const partsData = report.topSellingParts.map((p, idx) => [
      String(idx + 1),
      p.partName,
      p.category || 'N/A',
      String(p.quantitySold),
      `$${p.revenueGenerated.toFixed(2)}`
    ]);

    renderTable(partsHeaders, partsData, yStart + 51, [79, 70, 229]);

    // Section 3: Recent Transactions Table
    const nextY = (doc as any).lastAutoTable.finalY + 12;
    
    // Check if space remains on page, otherwise add page
    let transactionStartY = nextY + 5;
    if (transactionStartY > 260) {
      doc.addPage();
      transactionStartY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text('3. RECENT INVOICES & PURCHASES LOG', 15, transactionStartY - 5);

    const txHeaders = [['Transaction ID', 'Type', 'Date', 'Description', 'Amount', 'Status']];
    const txData = report.recentTransactions.map(tx => [
      tx.id,
      tx.type,
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      `$${tx.amount.toFixed(2)}`,
      tx.status
    ]);

    renderTable(txHeaders, txData, transactionStartY, [31, 41, 55]);

    // Add page numbers in footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Page ${i} of ${totalPages}  |  VP System Financial Operations Audit  |  Confidential`,
        15,
        287
      );
    }

    doc.save(`VP_Financial_Report_${periodName}_${report.referenceDate.split('T')[0]}.pdf`);
  };

  // Maximum quantity sold for relative progress bar calculation
  const maxQtySold = report?.topSellingParts[0]?.quantitySold || 1;

  return (
    <div className="animate-fade-in reports-wrapper p-4 bg-light text-dark">
      {/* Top Header Filter controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="mb-0 text-dark fw-bold">Financial Reports Dashboard</h2>
          <p className="text-muted mb-0">Monitor revenues, operating expenses, and export audited statements.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Form.Group className="mb-0">
            <Form.Select 
              value={period} 
              onChange={handlePeriodChange}
              className="bg-white text-dark border-secondary shadow-sm"
              style={{ width: '130px' }}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-0">
            {period === 'daily' && (
              <Form.Control
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-white text-dark border-secondary shadow-sm"
              />
            )}
            {period === 'monthly' && (
              <Form.Control
                type="month"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-white text-dark border-secondary shadow-sm"
              />
            )}
            {period === 'yearly' && (
              <Form.Control
                type="number"
                min="2020"
                max="2035"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-white text-dark border-secondary shadow-sm"
                style={{ width: '100px' }}
              />
            )}
          </Form.Group>

          <Button 
            variant="primary" 
            onClick={handleExportPDF}
            disabled={loading || !report}
            className="text-nowrap px-3 shadow-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-danger bg-dark text-danger mb-4 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5 className="text-secondary">Generating live aggregates...</h5>
        </div>
      ) : report ? (
        <>
          {/* Section 1: KPI Stat Cards */}
          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={4}>
              <Card className="bg-white border-light text-dark h-100 overflow-hidden shadow-sm hover-elevate">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between position-relative">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>Total Revenue</h6>
                    <h3 className="mb-0 text-dark fw-bold">${report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <small className="text-muted d-block mt-2">
                      Inflow from {report.totalSalesCount} sales invoices
                    </small>
                  </div>
                  <div className="rounded-circle bg-opacity-10 bg-primary p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                    <i className="bi bi-graph-up-arrow fs-3 text-primary"></i>
                  </div>
                  <div className="card-decoration" style={{ background: 'linear-gradient(to right, rgba(99, 102, 241, 0.03), transparent)' }}></div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={4}>
              <Card className="bg-white border-light text-dark h-100 overflow-hidden shadow-sm hover-elevate">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between position-relative">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>Total Expenses</h6>
                    <h3 className="mb-0 text-dark fw-bold">${report.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <small className="text-muted d-block mt-2">
                      Outflow from {report.totalPurchasesCount} purchase orders
                    </small>
                  </div>
                  <div className="rounded-circle bg-opacity-10 bg-danger p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <i className="bi bi-graph-down-arrow fs-3 text-danger"></i>
                  </div>
                  <div className="card-decoration" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.03), transparent)' }}></div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={4}>
              <Card className="bg-white border-light text-dark h-100 overflow-hidden shadow-sm hover-elevate">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between position-relative">
                  <div>
                    <h6 className="text-muted text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>Net Profit</h6>
                    <h3 className={`mb-0 fw-bold ${report.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${report.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <span className={`badge mt-2 border ${report.netProfit >= 0 ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-danger bg-opacity-10 text-danger border-danger'}`}>
                      {report.netProfit >= 0 ? 'Surplus Balance' : 'Deficit Balance'}
                    </span>
                  </div>
                  <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px', backgroundColor: report.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                    <i className={`bi ${report.netProfit >= 0 ? 'bi-cash-coin text-success' : 'bi-shield-exclamation text-danger'} fs-3`}></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Section 2: Charts */}
          <Row className="g-4 mb-4">
            <Col xs={12} lg={7}>
              <Card className="bg-white text-dark border-light shadow-sm h-100">
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold">Revenue vs Expenses Breakdown</h5>
                    <span className="badge bg-secondary text-uppercase">{period} trend</span>
                  </div>
                  <div style={{ minHeight: '320px', flex: 1 }} className="d-flex align-items-center justify-content-center">
                    {revenueData.length > 0 || expensesData.length > 0 ? (
                      <Bar data={barData} options={chartOptions} />
                    ) : (
                      <span className="text-muted small">No transaction points recorded in this frame.</span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={5}>
              <Card className="bg-white text-dark border-light shadow-sm h-100">
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold">Net Income Progression</h5>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success">Live Curve</span>
                  </div>
                  <div style={{ minHeight: '320px', flex: 1 }} className="d-flex align-items-center justify-content-center">
                    {profitData.length > 0 ? (
                      <Line data={trendData} options={chartOptions} />
                    ) : (
                      <span className="text-muted small">No net income progression curves available.</span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Section 3: Tables Grid */}
          <Row className="g-4">
            {/* Top Selling Parts */}
            <Col xs={12} lg={5}>
              <Card className="bg-white text-dark border-light shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="mb-4 fw-semibold d-flex align-items-center gap-2">
                    <i className="bi bi-star-fill text-warning"></i>
                    <span>Top Performing Parts</span>
                  </h5>
                  {report.topSellingParts.length > 0 ? (
                    <div className="top-parts-container">
                      {report.topSellingParts.map((item, idx) => {
                        const percent = Math.round((item.quantitySold / maxQtySold) * 100);
                        return (
                          <div key={item.partId} className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div>
                                <span className="fw-medium text-dark">{item.partName}</span>
                                <span className="text-muted small d-block">{item.category}</span>
                              </div>
                              <div className="text-end">
                                <span className="fw-semibold text-dark">{item.quantitySold} units</span>
                                <span className="text-success small d-block">${item.revenueGenerated.toFixed(2)}</span>
                              </div>
                            </div>
                            <ProgressBar 
                              now={percent} 
                              variant={idx === 0 ? "primary" : idx === 1 ? "info" : "success"} 
                              style={{ height: '6px' }}
                              className="bg-secondary bg-opacity-25"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center py-5 text-muted small">
                      No parts sold in this financial reporting window.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Recent Transaction Auditing Log */}
            <Col xs={12} lg={7}>
              <Card className="bg-white text-dark border-light shadow-sm h-100">
                <Card.Body className="p-4 d-flex flex-column">
                  <h5 className="mb-4 fw-semibold d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check text-primary"></i>
                    <span>Recent Transactions Audit Log</span>
                  </h5>
                  {report.recentTransactions.length > 0 ? (
                    <div className="table-responsive flex-grow-1">
                      <Table hover className="align-middle mb-0 text-nowrap">
                        <thead>
                          <tr className="text-muted border-bottom small">
                            <th>Transaction ID</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.recentTransactions.map((tx) => (
                            <tr key={tx.id} className="border-bottom">
                              <td className="fw-bold text-dark small">{tx.id}</td>
                              <td>
                                <span className={`badge ${tx.type === 'Sale' ? 'bg-primary' : 'bg-danger'} bg-opacity-10 ${tx.type === 'Sale' ? 'text-primary' : 'text-danger'} border ${tx.type === 'Sale' ? 'border-primary' : 'border-danger'} small`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="small text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="small text-dark text-truncate" style={{ maxWidth: '160px' }}>{tx.description}</td>
                              <td className="fw-semibold text-dark">${tx.amount.toFixed(2)}</td>
                              <td>
                                <span className={`badge rounded-pill small ${
                                  tx.status === 'PAID' || tx.status === 'COMPLETED' ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-15 text-warning'
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center py-5 my-auto text-muted small">
                      No invoices or purchase orders generated.
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Alert variant="warning" className="border-warning bg-dark text-warning shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Failed to assemble report. Check database status or date frames.
        </Alert>
      )}
    </div>
  );
};
