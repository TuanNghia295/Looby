const testSignIn = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'tuan 1', password: '123123' })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error details:', error);
  }
};

testSignIn();
