#!/usr/bin/env python3
"""Replace ALL recharts components with simple CSS visualizations"""
import re

print("🔧 Replacing all recharts components with CSS-based charts...")

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace CarbonForecast component
carbon_pattern = r'const CarbonForecast = \(\) => \{.*?^\};'
carbon_replacement = '''const CarbonForecast = () => {
  const data = [
    { year: "2026", value: 4.2 },
    { year: "2027", value: 3.8 },
    { year: "2028", value: 3.2 },
    { year: "2029", value: 2.5 },
    { year: "2030", value: 1.8 },
  ];
  
  const maxValue = 5;

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-green-500" />
            Carbon Forecast
          </h3>
          <p className="text-nature-500 text-sm">
            Projected emissions reduction
          </p>
        </div>
      </div>
      <div className="relative h-[200px] w-full flex items-end justify-around gap-4 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all hover:opacity-80"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`${item.year}: ${item.value}M tons`}
            />
            <span className="text-xs text-nature-400 font-medium">{item.year}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-nature-500">Target: Net Zero by 2030</p>
      </div>
    </div>
  );
};'''

content = re.sub(carbon_pattern, carbon_replacement, content, flags=re.MULTILINE | re.DOTALL)

# Find and replace IndustrialESGChart
esg_pattern = r'const IndustrialESGChart = \(\) => \{.*?^\};'
esg_replacement = '''const IndustrialESGChart = () => {
  const data = [
    { month: "Jan", compliance: 78, impact: 45 },
    { month: "Feb", compliance: 82, impact: 52 },
    { month: "Mar", compliance: 85, impact: 58 },
    { month: "Apr", compliance: 88, impact: 65 },
    { month: "May", compliance: 91, impact: 72 },
    { month: "Jun", compliance: 94, impact: 78 },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Factory size={24} className="text-blue-500" />
            ESG Compliance
          </h3>
          <p className="text-nature-500 text-sm">
            Environmental, Social & Governance metrics
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {data.slice(-3).map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-nature-600 font-medium">{item.month}</span>
              <span className="text-nature-900 font-bold">{item.compliance}%</span>
            </div>
            <div className="h-3 bg-nature-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${item.compliance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center pt-4 border-t border-nature-100">
        <p className="text-sm text-emerald-600 font-bold">↑ 16% improvement this quarter</p>
      </div>
    </div>
  );
};'''

content = re.sub(esg_pattern, esg_replacement, content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ All recharts components replaced with CSS visualizations!")
print("\nComponents updated:")
print("  ✓ CarbonForecast - Simple bar chart")
print("  ✓ IndustrialESGChart - Progress bars")
print("  ✓ PollinatorActivity - Already fixed")
print("\nNo more infinite loops!")
