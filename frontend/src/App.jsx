import { useState } from 'react'

function App() {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    targetRent: '',
    groceries: '',
    transportation: '',
    otherExpenses: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Send the POST request to your Spring Boot server
      const response = await fetch('http://localhost:8080/api/budget/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Server failed to generate file");

      // 2. Convert the response bytes into a JavaScript Blob
      const blob = await response.blob();
      
      // 3. Create a temporary invisible link to force the browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Community_Budget_Plan.xlsx'); 
      document.body.appendChild(link);
      link.click();
      
      // 4. Clean up the temporary link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Make sure your Spring Boot server is running on port 8080!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Community Budget Generator</h2>
      <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label>Monthly Income ($):
          <input type="number" name="monthlyIncome" onChange={handleChange} required style={{ width: '100%' }}/>
        </label>
        
        <label>Target Rent ($):
          <input type="number" name="targetRent" onChange={handleChange} required style={{ width: '100%' }}/>
        </label>
        
        <label>Groceries ($):
          <input type="number" name="groceries" onChange={handleChange} required style={{ width: '100%' }}/>
        </label>
        
        <label>Transportation ($):
          <input type="number" name="transportation" onChange={handleChange} required style={{ width: '100%' }}/>
        </label>
        
        <label>Other Expenses ($):
          <input type="number" name="otherExpenses" onChange={handleChange} required style={{ width: '100%' }}/>
        </label>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Generate Google Sheets File
        </button>
      </form>
    </div>
  )
}

export default App