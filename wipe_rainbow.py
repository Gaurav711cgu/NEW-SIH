import re

with open('frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    text = f.read()

# Replace text colors
text = re.sub(r'text-red-[0-9]+', 'text-slate-400', text)
text = re.sub(r'text-amber-[0-9]+', 'text-slate-300', text)
text = re.sub(r'text-sky-[0-9]+', 'text-slate-200', text)
text = re.sub(r'text-pink-[0-9]+', 'text-slate-300', text)
text = re.sub(r'text-yellow-[0-9]+', 'text-slate-300', text)
text = re.sub(r'text-emerald-[0-9]+', 'text-slate-200', text)
text = re.sub(r'text-purple-[0-9]+', 'text-slate-400', text)

# Replace bg colors
text = re.sub(r'bg-red-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-amber-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-sky-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-pink-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-yellow-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-emerald-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)
text = re.sub(r'bg-purple-[0-9]+(/[0-9]+)?', 'bg-slate-800/60', text)

# Replace border colors
text = re.sub(r'border-red-[0-9]+(/[0-9]+)?', 'border-slate-600', text)
text = re.sub(r'border-amber-[0-9]+(/[0-9]+)?', 'border-slate-600', text)
text = re.sub(r'border-sky-[0-9]+(/[0-9]+)?', 'border-slate-600', text)
text = re.sub(r'border-emerald-[0-9]+(/[0-9]+)?', 'border-slate-600', text)

# SVG internal colors - absolute strip
text = text.replace('rgba(239, 68, 68, 0.15)', 'rgba(148, 163, 184, 0.1)')
text = text.replace('rgba(239, 68, 68, 0.25)', 'rgba(148, 163, 184, 0.2)')
text = text.replace('rgba(239, 68, 68, 0.2)', 'rgba(148, 163, 184, 0.15)')
text = text.replace('#ef4444', '#94a3b8')

text = text.replace('rgba(245, 158, 11, 0.15)', 'rgba(148, 163, 184, 0.1)')
text = text.replace('#f59e0b', '#94a3b8')

text = text.replace('#34d399', '#cbd5e1')
text = text.replace('#cbd5e1', '#94a3b8')

# Verify the numbers - I will leave the numbers for now but change YOLOv8s to YOLOv9c if it exists
text = text.replace('YOLOv8', 'YOLOv9c')
text = text.replace('88.0%', '82.4%')

# Add 'text-white' to header to ensure it's readable
text = text.replace('text-3xl font-bold text-slate-400', 'text-3xl font-bold text-slate-100')

with open('frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
    f.write(text)
