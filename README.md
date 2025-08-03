# Jattis Agro Dashboard

A modern, responsive dashboard for agriculture management built with Next.js 14, Tailwind CSS, and TypeScript.

## Features

- 🎨 **Modern UI/UX** - Clean, professional design with agricultural theme
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 📊 **Interactive Charts** - Profit vs Expenses visualization using Recharts
- 🔍 **Search & Filter** - Advanced filtering capabilities across all pages
- 📈 **KPI Dashboard** - Key performance indicators with trend analysis
- 🎯 **Complete CRUD** - Create, read, update, delete operations for all records

## Pages

1. **Dashboard** - Overview with KPI cards and profit chart
2. **Dhaan Record** - Track rice collection from farmers
3. **Chuira Record** - Monitor rice processing and production
4. **Employee Salary** - Manage employee information and payroll
5. **Extra Expenses** - Track miscellaneous business expenses
6. **Sales** - Monitor sales performance and revenue

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Theme**: next-themes
- **Language**: TypeScript
- **Font**: Inter

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jattis-agro-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
jattis-agro-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   ├── dhaan-record/      # Dhaan Record page
│   ├── chuira-record/     # Chuira Record page
│   ├── employee-salary/   # Employee Salary page
│   ├── extra-expenses/    # Extra Expenses page
│   └── sales/             # Sales page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── navbar.tsx    # Top navigation
│   │   ├── sidebar.tsx   # Side navigation
│   │   └── dashboard-layout.tsx
│   ├── ui/               # UI components
│   │   ├── kpi-card.tsx  # KPI card component
│   │   └── profit-chart.tsx
│   └── theme-provider.tsx
├── public/               # Static assets
└── package.json
```

## Key Components

### Dashboard Layout
- Responsive navbar with branding and profile menu
- Collapsible sidebar with navigation links
- Theme toggle (light/dark mode)
- Mobile-friendly design

### KPI Cards
- Display key metrics with icons
- Trend indicators (positive/negative)
- Color-coded by category
- Hover effects and animations

### Data Tables
- Sortable and filterable
- Search functionality
- Action buttons (Edit, Delete, etc.)
- Status badges with color coding

### Charts
- Interactive line chart for profit vs expenses
- Responsive design
- Custom tooltips
- Dark mode support

## Customization

### Colors
The project uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Green shades for agricultural theme
- **Agricultural**: Yellow/beige shades
- **Supporting**: Blue, red, purple for different data types

### Adding New Pages
1. Create a new folder in `app/`
2. Add `page.tsx` with your component
3. Update the navigation in `components/layout/sidebar.tsx`
4. Use the `DashboardLayout` wrapper

### Styling
- All styles use Tailwind CSS classes
- Custom CSS in `app/globals.css`
- Component-specific styles in respective files

## Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 