import pandas as pd

# Load the data
data = pd.read_csv('data/us-states.csv')

# Convert date column to datetime format
data['date'] = pd.to_datetime(data['date'])

# Delete all data related to Virgin Islands, American Samoa, Guam, or Northern Mariana Islands
territories_to_remove = ["Virgin Islands", "American Samoa", "Guam", "Northern Mariana Islands"]
data = data[~data['state'].isin(territories_to_remove)]

# Add 0 for each state for January and February 2020 if there are NaN values
# Extract year and month from the date
data['year'] = data['date'].dt.year
data['month'] = data['date'].dt.month

# # Create a DataFrame for January and February 2020
# jan_feb_2020 = pd.DataFrame(columns=data.columns)
# states = data['state'].unique()
# for state in states:
#     jan_feb_2020 = pd.concat([jan_feb_2020, pd.DataFrame([{'state': state, 'date': pd.Timestamp(f'2020-01-{day}'), 'deaths': 0, 'year': 2020, 'month': 1} for day in range(1, 32)])], ignore_index=True)
#     jan_feb_2020 = pd.concat([jan_feb_2020, pd.DataFrame([{'state': state, 'date': pd.Timestamp(f'2020-02-{day}'), 'deaths': 0, 'year': 2020, 'month': 2} for day in range(1, 30)])], ignore_index=True)

# # Combine the new data with the original data
# data = pd.concat([data, jan_feb_2020], ignore_index=True)

# Filter data for the year 2020
year = '2022'
data_year = data[(data['date'] >= (year +'-01-01')) & (data['date'] <= (year + '-12-31'))]

# Calculate total deaths by state for 2020
total_deaths_state_year = data_year.groupby('state')['deaths'].sum().reset_index()
total_deaths_state_year.columns = ['state', 'total_deaths_'+year]

# Calculate monthly deaths by state for 2020
data_year['month'] = data_year['date'].dt.to_period('M')
monthly_deaths_state_year = data_year.groupby(['state', 'month'])['deaths'].sum().reset_index()
monthly_deaths_state_year.columns = ['state', 'month', 'monthly_deaths_'+year]
monthly_deaths_state_year['month'] = monthly_deaths_state_year['month'].astype(str)

# Save the cleaned data to new CSV files
total_deaths_state_year.to_csv('data/total_deaths_state_'+year+'.csv', index=False)
monthly_deaths_state_year.to_csv('data/monthly_deaths_state_'+year+'.csv', index=False)

print("Data cleaning and preprocessing completed.")
