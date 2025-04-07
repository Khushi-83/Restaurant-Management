import { useState } from 'react';
import { Card, Statistic, DatePicker } from 'antd';
import { Column } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import styles from './ReportsPanel.module.css'; // Assuming you'll create this CSS module

interface SalesData {
  time: string;
  value: number;
}

interface TopItem {
  name: string;
  count: number;
  revenue: number;
}

export default function ReportsPanel() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [range, setRange] = useState<'day' | 'week' | 'month'>('day');

  // Sample sales data
  const salesData: SalesData[] = [
    { time: '00:00', value: 0 },
    { time: '12:00', value: 12500 },
    { time: '15:00', value: 18500 },
    { time: '18:00', value: 24500 },
    { time: '21:00', value: 28500 },
  ];

  // Sample top items data
  const topItems: TopItem[] = [
    { name: 'Margherita Pizza', count: 42, revenue: 21000 },
    { name: 'Pasta Carbonara', count: 35, revenue: 17500 },
    { name: 'Caesar Salad', count: 28, revenue: 11200 },
  ];

  // Chart configuration
  const salesConfig = {
    data: salesData,
    xField: 'time',
    yField: 'value',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      time: { alias: 'Time' },
      value: { alias: 'Sales (₹)' },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Sales Reports</h2>
        <div className={styles.controls}>
          <DatePicker 
            value={date} 
            onChange={(newDate) => setDate(newDate || dayjs())} 
            className={styles.datePicker}
          />
          <div className={styles.rangeButtons}>
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                className={`${styles.rangeButton} ${range === r ? styles.active : ''}`}
                onClick={() => setRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <Card title="Hourly Sales" className={styles.card}>
          <Column {...salesConfig} />
        </Card>
      </div>

      <div className={styles.statsSection}>
        <Card title="Today's Summary" className={styles.card}>
          <div className={styles.statistics}>
            <Statistic title="Total Orders" value={127} />
            <Statistic title="Total Revenue" value={`₹${'68,420'}`} />
            <Statistic title="Average Order" value={`₹${'539'}`} />
          </div>
        </Card>

        <Card title="Top Items" className={styles.card}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.count}</td>
                  <td>₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}