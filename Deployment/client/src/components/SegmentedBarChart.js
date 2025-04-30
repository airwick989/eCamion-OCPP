import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
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

// Custom shape renderer to apply x-offset per bar
const getCustomBarShape = (offset) => (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <Rectangle
      x={x + offset}
      y={y}
      width={width}
      height={height}
      fill={fill}
    />
  );
};

function SegmentedBarChart({ data, valueKeys, colors = [], label = 'Module' }) {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(valueKeys) || valueKeys.length === 0) {
    return <p style={{ padding: '1rem' }}>No data available</p>;
  }

  // Clean and normalize data
  const cleanedData = data.map((item) => {
    const cleanedItem = {
      [label]: item[label] ? `${item[label]}` : 'N/A',
    };
    valueKeys.forEach((key) => {
      cleanedItem[key] = parseFloat(item[key]) || 0;
    });
    return cleanedItem;
  });

  // Sort keys so lower values are left (drawn with more negative offset)
  const sortedValueKeys = [...valueKeys].sort((a, b) => {
    const totalA = cleanedData.reduce((sum, d) => sum + d[a], 0);
    const totalB = cleanedData.reduce((sum, d) => sum + d[b], 0);
    return totalA - totalB; // smallest first (leftmost)
  });

  const OFFSET_STEP = 0; // Horizontal pixels between bars

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={cleanedData}
          margin={{ right: 30, left: 20, bottom: 20 }}
          barCategoryGap="0%"
          barGap={0}
        >
          <XAxis
            dataKey={label}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
          />
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

          {sortedValueKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              shape={getCustomBarShape(index * OFFSET_STEP)}
              barSize={20}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SegmentedBarChart;