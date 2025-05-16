import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { grey } from '@mui/material/colors';

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
  '#a4de6c', '#d0ed57', '#8dd1e1',
];

const getCustomBarShape = (offset) => (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <Rectangle x={x + offset} y={y} width={width} height={height} fill={fill} />
  );
};

function SegmentedBarChart({ data, valueKeys, colors = [], label = 'Module', title }) {
  const [yMin, setYMin] = useState(null);
  const [yMax, setYMax] = useState(null);
  const [isYAxisDialogOpen, setIsYAxisDialogOpen] = useState(false);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setYMin(null);
    setYMax(null);
  }, [data]);

  const handleOpenYAxisDialog = () => {
    setInputMin(yMin ?? '');
    setInputMax(yMax ?? '');
    setIsYAxisDialogOpen(true);
  };

  const handleCloseYAxisDialog = () => {
    setIsYAxisDialogOpen(false);
    setError('');
  };

  const handleApplyYAxisRange = () => {
    const min = parseFloat(inputMin);
    const max = parseFloat(inputMax);

    if (isNaN(min) || isNaN(max)) {
      setError('Both values must be numbers.');
    } else if (min >= max) {
      setError('Minimum must be less than maximum.');
    } else {
      setYMin(min);
      setYMax(max);
      handleCloseYAxisDialog();
    }
  };

  const handleResetYAxis = () => {
    setYMin(null);
    setYMax(null);
    handleCloseYAxisDialog();
  };

  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(valueKeys) || valueKeys.length === 0) {
    return <p style={{ padding: '1rem' }}>No data available</p>;
  }

  const cleanedData = data.map((item) => {
    const cleanedItem = { [label]: item[label] ? `${item[label]}` : 'N/A' };
    valueKeys.forEach((key) => {
      cleanedItem[key] = parseFloat(item[key]) || 0;
    });
    return cleanedItem;
  });

  const sortedValueKeys = [...valueKeys].sort((a, b) => {
    const totalA = cleanedData.reduce((sum, d) => sum + d[a], 0);
    const totalB = cleanedData.reduce((sum, d) => sum + d[b], 0);
    return totalA - totalB;
  });

  const OFFSET_STEP = 0;

  return (
    <div style={{ width: '100%', height: 350, marginBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3>{title}</h3>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenYAxisDialog}
          sx={{ borderRadius: '8px', color: grey[700], borderColor: grey[400], height: '44px', fontWeight: 400 }}
        >
          Set Y-Axis
        </Button>
      </div>

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
            domain={
              yMin !== null && yMax !== null
                ? [yMin, yMax]
                : ['auto', 'auto']
            }
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

      {/* Y-Axis Range Dialog */}
      <Dialog open={isYAxisDialogOpen} onClose={handleCloseYAxisDialog}>
        <DialogTitle>Set Y-Axis Range</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            label="Maximum"
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            type="number"
            label="Minimum"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            fullWidth
            margin="normal"
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetYAxis}>Reset</Button>
          <Button onClick={handleCloseYAxisDialog}>Cancel</Button>
          <Button onClick={handleApplyYAxisRange} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SegmentedBarChart;