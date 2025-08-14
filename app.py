from flask import Flask, render_template, request, jsonify
import math
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        
        # Step 1: Initial parameters (all values are now in mm from frontend)
        chain_pitch_mm = float(data['chainPitch'])
        number_of_teeth = int(data['numberOfTeeth'])
        chain_type = data['chainType']
        
        # Generate product name
        product_name = f"{chain_pitch_mm:.1f}X{number_of_teeth} {chain_type}"
        
        # Step 2: Additional parameters (all values are now in mm from frontend)
        chain_roller_diameter_mm = float(data['chainRollerDiameter'])
        od_mm = float(data['od'])
        hub_dia_mm = float(data['hubDia'])
        hub_length_mm = float(data['hubLength'])
        zz_mm = float(data['zz'])
        
        # Step 3: PCD calculation
        if data.get('pcdManual'):
            pcd_mm = float(data['pcdManual'])
        else:
            pcd_mm = (chain_pitch_mm * number_of_teeth) / math.pi
        
        # Step 4: Component calculations
        # Sprocket calculations
        sprocket_raw_size = od_mm + 10
        sprocket_length = zz_mm + 7
        sprocket_rmc_per_kg = float(data['sprocketRmcPerKg'])
        sprocket_pc = float(data['sprocketPc'])
        sprocket_ht = float(data['sprocketHt'])
        
        sprocket_rmc = 0.0062 * sprocket_raw_size * sprocket_raw_size * (sprocket_length/1000) * sprocket_rmc_per_kg
        sprocket_production_cost = sprocket_rmc + sprocket_pc + sprocket_ht
        
        # Hub calculations
        hub_raw_size = hub_dia_mm + 15
        hub_length_calc = hub_length_mm + 7
        hub_rmc_per_kg = float(data['hubRmcPerKg'])
        hub_pc = float(data['hubPc'])
        hub_ht = float(data['hubHt'])
        
        hub_rmc = 0.0062 * hub_raw_size * hub_raw_size * (hub_length_calc/1000) * hub_rmc_per_kg
        hub_production_cost = hub_rmc + hub_pc + hub_ht
        
        # Total production cost
        total_production_cost = sprocket_production_cost + hub_production_cost
        
        # Step 5: Price chart calculations
        price_chart = []
        multipliers = [1.4, 1.5, 1.6, 1.7, 1.8]
        margins = ['40%', '50%', '60%', '70%', '80%']
        
        for i, multiplier in enumerate(multipliers):
            selling_price = total_production_cost * multiplier
            net_price = selling_price * 1.18  # Including 18% GST
            price_chart.append({
                'selling_price': round(selling_price, 2),
                'margin': margins[i],
                'net_price': round(net_price, 2)
            })
        
        # Prepare response data
        result = {
            'product_name': product_name,
            'pcd_mm': round(pcd_mm, 2),
            'components': {
                'sprocket': {
                    'raw_size': round(sprocket_raw_size, 2),
                    'length': round(sprocket_length, 2),
                    'rmc_per_kg': sprocket_rmc_per_kg,
                    'rmc': round(sprocket_rmc, 2),
                    'pc': sprocket_pc,
                    'ht': sprocket_ht,
                    'production_cost': round(sprocket_production_cost, 2)
                },
                'hub': {
                    'raw_size': round(hub_raw_size, 2),
                    'length': round(hub_length_calc, 2),
                    'rmc_per_kg': hub_rmc_per_kg,
                    'rmc': round(hub_rmc, 2),
                    'pc': hub_pc,
                    'ht': hub_ht,
                    'production_cost': round(hub_production_cost, 2)
                }
            },
            'total_production_cost': round(total_production_cost, 2),
            'price_chart': price_chart
        }
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 