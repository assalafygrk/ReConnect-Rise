import os
import re

def find_missing_icons(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all <IconName ... /> or <IconName>
    used_icons = re.findall(r'<([A-Z][a-zA-Z0-9]+)', content)
    
    # Find icons in arrays like icon: IconName
    used_icons += re.findall(r'icon:\s*([A-Z][a-zA-Z0-9]+)', content)
    
    # Find imports from lucide-react
    import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]', content, re.DOTALL)
    if not import_match:
        return []
    
    imported_icons = [i.strip() for i in import_match.group(1).split(',')]
    
    # Remove duplicates and filter out non-lucide icons (like React components)
    unique_used = set(used_icons)
    missing = []
    for icon in unique_used:
        if icon not in imported_icons and icon not in ['AreaChart', 'Area', 'XAxis', 'YAxis', 'Tooltip', 'ResponsiveContainer', 'CartesianGrid', 'WeeklyReportTemplate', 'TransactionReceipt', 'Icon']:
            missing.append(icon)
    
    return missing

files = ['src/pages/DashboardPage.jsx', 'src/pages/MembersPage.jsx', 'src/pages/WelfarePage.jsx', 'src/pages/DisbursementsPage.jsx', 'src/pages/LoansPage.jsx']
for file in files:
    if os.path.exists(file):
        missing = find_missing_icons(file)
        if missing:
            print(f"File: {file} - Missing Icons: {missing}")
    else:
        print(f"File: {file} not found")
