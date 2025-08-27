
export default function Cities(){
   
    const addCity = async (cityName) => {
        try {
          const response = await fetch('http://localhost:4000/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: cityName }),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
          }
          alert('City added successfully');
        } catch (error) {
          console.error('Error adding city:', error);
          alert('Unable to add City')
        }
      };
      
       const fetchCities = async () => {
        try {
          const response = await fetch('http://localhost:4000/cities');
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching cities:', error);
          return [];
        }
      };

    return{
        addCity,
    fetchCities,
    }
}
 
  
  