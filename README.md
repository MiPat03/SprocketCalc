# Sprocket Costing Calculator

A Flask-based web application for calculating manufacturing costs and pricing for chain sprockets and hubs. This tool helps manufacturers determine production costs, pricing strategies, and component specifications.

## Features

- **Chain Sprocket Calculations**: Automatic calculation of PCD (Pitch Circle Diameter)
- **Cost Analysis**: Raw material cost, production cost, and heat treatment calculations
- **Pricing Strategy**: Multiple margin options (40% to 80%) with GST calculations
- **Component Specifications**: Detailed specifications for sprockets and hubs
- **Modern UI**: Responsive design with Bootstrap and custom styling

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Deployment**: Ready for Render, Heroku, Railway, and other platforms
- **Company**: Tripcon Industries

## Local Development

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd manufacturing_app
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## Deployment

This app is configured for easy deployment on various platforms:

### Render (Recommended)
1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Select Python as the runtime
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`

### Heroku
1. Install Heroku CLI
2. Run `heroku create your-app-name`
3. Push to Heroku: `git push heroku main`

### Railway
1. Connect your GitHub repository
2. Railway will auto-detect the Python app
3. Deploy automatically

## Project Structure

```
manufacturing_app/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Procfile           # Deployment configuration
├── runtime.txt        # Python version specification
├── .gitignore         # Git ignore rules
├── README.md          # This file
├── static/
│   └── script.js      # Frontend JavaScript logic
└── templates/
    └── index.html     # Main HTML template
```

## API Endpoints

- `GET /` - Main application page
- `POST /calculate` - Calculate manufacturing costs and pricing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support, please open an issue in the GitHub repository. 