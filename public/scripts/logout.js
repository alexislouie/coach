const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

fetch(`http://localhost:8080/auth/logout`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer}`
            }
        })
        .then(res => {
            if (res.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                window.location.replace('/index.html');
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })