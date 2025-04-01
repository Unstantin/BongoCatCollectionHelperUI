import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS_BY_RARITY = {
  common: '#B0B0B0',
  uncommon: '#5ACC3D',
  rare: '#258ED4',
  epic: '#B939DB',
  legendary: '#FFB000'
};

export default function CustomPieChart({ category, isActive, onClick }) {
  const { user_n, all_n, name } = category;
  const fillPercent = (user_n / all_n) * 100;
  
  const chartData = [
    { name: 'Collected', value: fillPercent },
    { name: 'Remaining', value: 100 - fillPercent }
  ];

  const categoryColor = COLORS_BY_RARITY[name.toLowerCase()] || '#8884d8';

  return (
    <div 
      className={`chart ${isActive ? 'active' : ''}`} 
      onClick={onClick}
      style={{
        border: isActive ? '3px solid #8B4513' : '1px solid #D2B48C',
        transform: isActive ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      <h3 style={{ color: isActive ? '#8B4513' : '#5D4037' }}>
        {name.toUpperCase()}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={categoryColor} />
            <Cell fill="#f0f0f0" />
          </Pie>
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize={20}
            fill={categoryColor}
          >
            {`${Math.round(fillPercent)}%`}
          </text>
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-label">
        {user_n} / {all_n}
      </div>
    </div>
  );
}