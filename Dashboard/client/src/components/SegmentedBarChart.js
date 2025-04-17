import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#a4de6c',
  '#d0ed57',
  '#8dd1e1',
];

function SegmentedBarChart({ data, valueKeys, colors = [], label = 'Module' }) {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(valueKeys) || valueKeys.length === 0) {
    return <p style={{ padding: '1rem' }}>No data available</p>;
  }

  const cleanedData = data.map((item) => {
    const cleanedItem = {
      [label]: item[label] ? `${item[label]}` : 'N/A',
    };
    valueKeys.forEach((key) => {
      cleanedItem[key] = parseFloat(item[key]) || 0;
    });
    return cleanedItem;
  });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={cleanedData}
          margin={{ right: 30, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey={label}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
          >
          </XAxis>
          <YAxis
            label={{
              value: 'Value',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
            }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {valueKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={colors[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              radius={[index === valueKeys.length - 1 ? 4 : 0, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SegmentedBarChart;