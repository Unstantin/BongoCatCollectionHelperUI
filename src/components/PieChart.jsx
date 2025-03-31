import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS_BY_RARITY = {
  common: '#B0B0B0',
  uncommon: '#5ACC3D',
  rare: '#258ED4',
  epic: '#B939DB',
  legendary: '#FFB000'
};

export default function CustomPieChart({ category, onClick }) {
  const fillPercent = (category.user_n / category.all_n) * 100;
  const remainingPercent = 100 - fillPercent;
  
  const chartData = [
    { name: 'Collected', value: fillPercent },
    { name: 'Remaining', value: remainingPercent }
  ];

  const categoryColor = COLORS_BY_RARITY[category.name.toLowerCase()] || '#8884d8';

  return (
    <div className="chart-wrapper" onClick={() => onClick(category)}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
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
          <Tooltip 
            formatter={(value, name) => [
              name === 'Collected' 
                ? `${category.user_n}/${category.all_n}` 
                : `${category.all_n - category.user_n}/${category.all_n}`,
              name
            ]}
          />
          <Legend />
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
    </div>
  );
}