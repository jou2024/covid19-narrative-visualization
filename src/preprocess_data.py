import pandas as pd

# Load the data
data = pd.read_csv('data/us-states.csv')

# Convert date column to datetime format
data['date'] = pd.to_datetime(data['date'])

year = '2020'
# Filter data for the year 2022
data_year = data[(data['date'] >= (year +'-01-01')) & (data['date'] <= (year + '-12-31'))]

# Calculate total deaths by state for 2022
total_deaths_state_year = data_year.groupby('state')['deaths'].sum().reset_index()
total_deaths_state_year.columns = ['state', 'total_deaths_'+year]

# Calculate monthly deaths by state for 2022
data_year['month'] = data_year['date'].dt.to_period('M')
monthly_deaths_state_year = data_year.groupby(['state', 'month'])['deaths'].sum().reset_index()
monthly_deaths_state_year.columns = ['state', 'month', 'monthly_deaths_'+year]
monthly_deaths_state_year['month'] = monthly_deaths_state_year['month'].astype(str)

# Save the cleaned data to new CSV files
total_deaths_state_year.to_csv('data/total_deaths_state_'+year+'.csv', index=False)
monthly_deaths_state_year.to_csv('data/monthly_deaths_state_'+year+'.csv', index=False)

print("Data cleaning and preprocessing completed.")
