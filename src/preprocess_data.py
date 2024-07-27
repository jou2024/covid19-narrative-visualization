import pandas as pd

# Load the data
data = pd.read_csv('../data/us-states.csv')

# Convert date column to datetime format
data['date'] = pd.to_datetime(data['date'])

# Filter data for the year 2022
data_2022 = data[(data['date'] >= '2022-01-01') & (data['date'] <= '2022-12-31')]

# Calculate total deaths by state for 2022
total_deaths_state_2022 = data_2022.groupby('state')['deaths'].sum().reset_index()
total_deaths_state_2022.columns = ['state', 'total_deaths_2022']

# Calculate monthly deaths by state for 2022
data_2022['month'] = data_2022['date'].dt.to_period('M')
monthly_deaths_state_2022 = data_2022.groupby(['state', 'month'])['deaths'].sum().reset_index()
monthly_deaths_state_2022.columns = ['state', 'month', 'monthly_deaths_2022']
monthly_deaths_state_2022['month'] = monthly_deaths_state_2022['month'].astype(str)

# Save the cleaned data to new CSV files
total_deaths_state_2022.to_csv('../data/total_deaths_state_2022.csv', index=False)
monthly_deaths_state_2022.to_csv('../data/monthly_deaths_state_2022.csv', index=False)

print("Data cleaning and preprocessing completed.")
