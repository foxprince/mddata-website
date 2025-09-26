# MDdata - Financial Data Platform Website

A professional financial data platform website that provides advanced analytics and real-time market intelligence. This is a pure frontend implementation with no backend dependencies.

## Features

- Real-time simulated financial data for stocks, forex, and cryptocurrencies
- Interactive charts using Chart.js
- User registration with invitation code validation
- Responsive design using Tailwind CSS
- Pure static HTML/CSS/JavaScript implementation

## Pages

1. **index.html** - Main dashboard showing market overview
2. **register.html** - User registration with invitation code
3. **login.html** - User login page
4. **detail.html** - Detailed view for individual financial instruments

## Technical Implementation

### Data Simulation
- All data is generated dynamically using JavaScript
- No real API calls - completely simulated
- Realistic price fluctuations and market movements

### Valid Invitation Codes
- INVITE123
- WELCOME456
- STOCK789

### Libraries Used
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Charting library
- [Font Awesome](https://fontawesome.com/) - Icons

## How to Run

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Navigate between pages using the navigation menu

## Customization

### Adding New Financial Instruments
1. Modify the arrays in `js/data-simulation.js`:
   - `stocks` - Add new stock symbols and names
   - `forexPairs` - Add new forex pairs
   - `cryptocurrencies` - Add new cryptocurrencies

### Changing Valid Invitation Codes
1. Edit the `validInviteCodes` array in:
   - `register.html` (registration page)
   - Add or remove codes as needed

### Styling
1. All styling is done through Tailwind CSS classes
2. Custom styles can be added by modifying the HTML directly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.