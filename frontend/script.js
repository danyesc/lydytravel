// Función para registrar un nuevo usuario
async function registerUser(nombre, email, password) {
    if (!nombre || !email || !password) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en el registro.");
        }

        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = 'login.html';

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert(error.message || "No se pudo conectar con el servidor.");
    }
}

// Función para iniciar sesión
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en el login.");
        }

        const data = await response.json();
        if (data.nombre && data.token) {
            localStorage.setItem('username', data.nombre);
            localStorage.setItem('token', data.token);
        } else {
            throw new Error("Datos de respuesta inválidos");
        }        
        alert("Inicio de sesión exitoso.");
        window.location.href = 'feed.html';

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert(error.message || "No se pudo conectar con el servidor.");
    }
}

// Función para crear una nueva publicación
async function createPost(title, content, imageFile) {
    if (!title || !content) {
        alert("El título y el contenido son obligatorios.");
        return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
        alert("Debes iniciar sesión para publicar.");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('username', username); // Asegúrate de que sea username
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al crear la publicación.");
        }

        alert("Publicación creada exitosamente.");
        window.location.href = 'feed.html';

    } catch (error) {
        console.error("Error al crear publicación:", error);
        alert(error.message || "No se pudo conectar con el servidor.");
    }
}

// Función para obtener todas las publicaciones
async function fetchPosts() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error('Error al cargar publicaciones');

        const posts = await response.json();
        console.log("Datos recibidos del servidor:", posts);

        const postsContainer = document.querySelector('.posts');
        
        // Limpiar el contenedor antes de agregar nuevas publicaciones
        postsContainer.innerHTML = '';

        // Iterar sobre cada publicación y crear elementos HTML
        posts.results.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <h4>${post.location}</h4>
                ${post.image ? `<img src="http://localhost:3000/uploads/${post.image}" alt="${post.title}" style="width: 200px; height: auto;" onerror="this.onerror=null; this.src='fallback-image.jpg';">` : '<p>Sin imagen</p>'}
                <p>${post.content}</p>
                <p><strong>Publicado por:</strong> ${post.username || 'Desconocido'}</p>
                <button class="delete-post" data-id="${post.id}">Eliminar</button>
            `;
            postsContainer.appendChild(postElement); // Agregar el elemento al contenedor
        });
        
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        alert("No se pudieron cargar las publicaciones. " + error.message);
    }
}

// Función para eliminar una publicación
async function deletePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Incluye el token si es necesario
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar la publicación");
        }

        // Si la publicación se eliminó correctamente, vuelve a cargar las publicaciones
        fetchPosts(); // O elimina la publicación del DOM directamente
        alert("Publicación eliminada");

    } catch (error) {
        console.error("Error al eliminar publicación:", error);
        alert(error.message);
    }
}

// Evento DOMContentLoaded para ejecutar funciones cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts(); // Cargar las publicaciones

    // Manejar el formulario de creación de publicaciones
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
      createPostForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const title = document.getElementById('title').value;
          const content = document.getElementById('description').value;
          const imageFile = document.getElementById('image').files[0];

          createPost(title, content, imageFile); // Crear la publicación
      });
    }

    // Manejar clics en el contenedor de publicaciones para eliminar
    const postsContainer = document.querySelector('.posts'); 
    postsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-post')) {
          const postId = event.target.dataset.id; // Obtener el ID del post desde el atributo data-id
          deletePost(postId); // Llamar a la función deletePost
      }
  });

  // Mostrar el nombre de usuario si está disponible
  const username = localStorage.getItem('username');
  if (username) {
      const usernameSpan = document.getElementById('username');
      if (usernameSpan) {
          usernameSpan.textContent = username;
      }
  }

});

