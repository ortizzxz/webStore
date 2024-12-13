window.onload = () => {
  // === DOM Elements ===
  // Buttons and Links
  const inicioBtn = document.getElementById("inicio");
  const inicioLink = document.getElementById("inicioLink");
  const carritoLink = document.getElementById("carritoLink");
  const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
  const procederPagoBtn = document.getElementById('procederPago');
  const cerrarCarritoBtn = document.getElementById('cerrarCarrito');
  const productoModalCerrarBtn = document.getElementById('productoModalCerrarBtn');

  // Containers and Sections
  const hero = document.getElementById("hero");
  const productosContainer = document.getElementById("productos-container");
  const categoriasContainer = document.getElementById('categorias');

  // Specific Elements
  const productos = document.getElementById("productos");
  const categorias = document.querySelectorAll(".link-categorias");
  const carritoCount = document.getElementById('carritoCount');
  const carritoModal = document.getElementById('carrito');
  const productoModal = document.getElementById('productoModal');
  const carritoProductos = document.getElementById('carritoProductos');
  const carritoTotal = document.getElementById('carritoTotal');

  // === API Configuration ===
  const API_URL = "https://api.escuelajs.co/api/v1/products";
  const LIMIT = 10; // Limit to 10

  // === Variables ===
  let offset = 0; // Tracks the number of loaded products
  let loading = false; // Prevents duplicate API calls during loading
  let productosCargados = []; // Stores loaded products
  let categoriaProducto = null; // Tracks the selected category

  // Carrito Informaiton
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  // === Funciones para gestionar el carrito ===

  // Actualiza el contador del carrito en el elemento correspondiente
  const actualizarCarritoCount = () => {
    carritoCount.innerHTML = carrito.length;
  };

  // Renderiza los productos en el carrito, mostrando el total y los detalles
  const renderCarrito = () => {
    if (carrito.length === 0) {
      // Si el carrito está vacío, muestra un mensaje y un total de $0.00
      carritoProductos.innerHTML = '<p>No hay productos en el carrito</p>';
      carritoTotal.innerHTML = 'Total: $0.00';
    } else {
      // Si hay productos, genera el HTML para mostrarlos
      carritoProductos.innerHTML = carrito.map(producto => `
      <div class="producto-carrito">
        <p><span id='productoTitleCarrito'>${producto.title}</span> - $${producto.price.toFixed(2)} x ${producto.cantidad}</p>
      </div>
    `).join('');  

      // Calcula el total del carrito y lo muestra
      const total = carrito.reduce((total, producto) => total + producto.price * producto.cantidad, 0);
      carritoTotal.innerHTML = `Total: $${total.toFixed(2)}`;
    }

    // Agregar un evento de delegación para eliminar productos
    carritoProductos.addEventListener('click', eliminarProductoHandler);
  };

  // Cierra el modal del producto al hacer clic en el botón correspondiente
  productoModalCerrarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    productoModal.style.display = 'none';
  });

  // Maneja la eliminación de un producto del carrito
  function eliminarProductoHandler(e) {
    if (e.target.classList.contains('btn-eliminar')) {
      const productoId = parseInt(e.target.getAttribute('data-id'));
      const productoIndex = carrito.findIndex(producto => producto.id === productoId);

      if (productoIndex > -1) {
        // Elimina el producto del carrito
        carrito.splice(productoIndex, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualiza el almacenamiento local
        renderCarrito(); // Vuelve a renderizar el carrito
        actualizarCarritoCount(); // Actualiza el contador del carrito
      }
    }
  }

  // Abre el carrito al hacer clic en el enlace correspondiente
  carritoLink.addEventListener('click', (e) => {
    e.preventDefault();
    carritoModal.style.display = 'flex';
    renderCarrito();
  });

  // Cierra el carrito al hacer clic en el botón de cerrar
  cerrarCarritoBtn.addEventListener('click', () => {
    carritoModal.style.display = 'none';
  });

  // Vacía el carrito al hacer clic en el botón correspondiente
  vaciarCarritoBtn.addEventListener('click', () => {
    localStorage.removeItem('carrito'); // Elimina el carrito del almacenamiento local
    carrito.length = 0; // Vacía el array del carrito
    actualizarCarritoCount(); // Actualiza el contador del carrito
    renderCarrito(); // Vuelve a renderizar el carrito (ahora vacío)
  });

  // Función para añadir un producto al carrito
  const anadirAlCarrito = (producto) => {
    const productoExistente = carrito.find(item => item.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoCount();
  };

  // Función para obtener los productos
  const fetchProductos = async (categoriaSeleccionada) => {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(`${API_URL}?offset=${offset}&limit=${LIMIT}${categoriaSeleccionada ? `&categoryId=${categoriaSeleccionada}` : ''}`);
      const productos = await response.json();
      const productosNuevos = productos.filter(producto => !productosCargados.includes(producto.id));
      if (productosNuevos.length > 0) {
        renderProductos(productosNuevos, true); // Usa true para append
        productosNuevos.forEach(producto => productosCargados.push(producto.id));
        offset += LIMIT;
      } else {
        window.onscroll = null; // Desactivar el scroll infinito
      }
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      productosContainer.innerHTML += "<p>Hubo un error cargando los productos. Inténtalo más tarde.</p>";
    } finally {
      loading = false;
    }
  };

  // Función para proceder al pago
  procederPagoBtn.addEventListener('click', () => {
    alert('Procediendo al pago...');
  });

  // Función para mostrar los detalles del producto en el modal
  const mostrarDetallesProducto = (producto) => {
    // Rellenar el modal con la información del producto
    document.getElementById('productoModalTitulo').textContent = producto.title;
    document.getElementById('productoModalDescripcion').textContent = producto.description || 'No hay descripción disponible';
    document.getElementById('productoModalPrecio').textContent = `$${producto.price.toFixed(2)}`;

    // Mostrar el modal
    document.getElementById('productoModal').style.display = 'block';

    // Añadir la funcionalidad al botón de añadir al carrito
    document.getElementById('productoModalCarritoBtn').onclick = () => {
      anadirAlCarrito(producto);
      document.getElementById('productoModal').style.display = 'none';  // Cerrar el modal después de añadir al carrito
      renderCarrito();
    };
  };

  // === Función para renderizar los productos en la página ===
  const renderProductos = (productos, append = false) => {
    // Generar el HTML de los productos a partir de los datos de la API
    const productosHTML = productos.map(producto => `
    <div class="producto" data-id="${producto.id}">
      <div class="producto-imagenes">
        <div class="producto-carrusel">
          <!-- Controles del carrusel -->
          <button class="flecha flecha-izquierda">&#60;</button>
          <div class="producto-carrusel-imagenes">
            ${producto.images && producto.images.length > 0
        ? producto.images.map((image, index) => `
                <img src="${image}" alt="${producto.title}" class="producto-imagen" data-index="${index}" onerror="defaultImage(event)" />
              `).join('')
        : '<p>No hay imágenes disponibles</p>'
      }
          </div>
          <button class="flecha flecha-derecha">&#62;</button>
        </div>
      </div>
      <!-- Detalles del producto -->
      <h3>${producto.title}</h3>
      <p>$${producto.price.toFixed(2)}</p>
      <!-- Botones de acción -->
      <button class="btn-comprar" data-id="${producto.id}" data-title="${producto.title}" data-price="${producto.price}" data-images="${producto.images}">Comprar</button>
      <button class="btn-descripcion" data-id="${producto.id}" data-title="${producto.title}" data-price="${producto.price}" data-images="${producto.images}">Descripción</button>
    </div>
  `).join('');

    // Insertar los productos en el contenedor
    if (append) {
      productosContainer.insertAdjacentHTML('beforeend', productosHTML);
    } else {
      productosContainer.innerHTML = productosHTML;
    }

    // === Eventos ===
    // Mostrar detalles del producto al hacer clic en "Descripción"
    const botonesDescripcion = document.querySelectorAll('.btn-descripcion');
    botonesDescripcion.forEach(boton => {
      boton.addEventListener('click', (event) => {
        event.preventDefault();
        const productoId = boton.dataset.id;
        const productoSeleccionado = productos.find(p => p.id == productoId);
        if (productoSeleccionado) {
          mostrarDetallesProducto(productoSeleccionado);
        }
      });
    });

    // Configurar el carrusel de imágenes para cada producto
    const carruseles = document.querySelectorAll('.producto-carrusel');
    carruseles.forEach(carrusel => {
      const flechaIzquierda = carrusel.querySelector('.flecha-izquierda');
      const flechaDerecha = carrusel.querySelector('.flecha-derecha');
      const imagenes = carrusel.querySelector('.producto-carrusel-imagenes');
      const imagenesArray = Array.from(imagenes.children);
      let indiceActual = 0;

      // Función para cambiar la imagen del carrusel
      const cambiarImagen = (nuevoIndice) => {
        imagenesArray.forEach((img, index) => img.style.display = 'none');
        imagenesArray[nuevoIndice].style.display = 'block';
      };

      // Mostrar la primera imagen al iniciar
      cambiarImagen(indiceActual);

      // Navegar a la imagen anterior
      flechaIzquierda.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que otros eventos se activen
        indiceActual = (indiceActual === 0) ? imagenesArray.length - 1 : indiceActual - 1;
        cambiarImagen(indiceActual);
      });

      // Navegar a la siguiente imagen
      flechaDerecha.addEventListener('click', (event) => {
        event.stopPropagation();
        indiceActual = (indiceActual === imagenesArray.length - 1) ? 0 : indiceActual + 1;
        cambiarImagen(indiceActual);
      });
    });

    // Añadir producto al carrito al hacer clic en "Comprar"
    const botonesComprar = document.querySelectorAll('.btn-comprar');
    botonesComprar.forEach(boton => {
      boton.addEventListener('click', (event) => {
        const producto = {
          id: event.target.dataset.id,
          title: event.target.dataset.title,
          price: parseFloat(event.target.dataset.price),
          images: event.target.dataset.images,
        };
        anadirAlCarrito(producto); // Añadir producto al carrito
        renderCarrito(); // Actualizar la vista del carrito
      });
    });
  };

  // Función de scroll infinito
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      if (categoriaProducto) {
        fetchProductos(categoriaProducto);
      } else {
        fetchProductos();
      }
    }
  };

  window.addEventListener('scroll', handleScroll);

  // Filtro por categoría
  categorias.forEach(categoria => {
    categoria.addEventListener('click', (e) => {
      e.preventDefault();
      productos.style.display = "inline";
      hero.style.display = "none";
      categoriasContainer.style.display = 'none';

      const categoriaSeleccionada = new URL(e.target.closest('a').href).searchParams.get('categoria');

      productosContainer.innerHTML = '';
      productosCargados = [];
      offset = 0;
      categoriaProducto = categoriaSeleccionada; // Actualizar la variable global
      fetchProductos(categoriaSeleccionada);
    });
  });

  // === Manejo de Modales y Navegación ===

  // Enlace para abrir el modal de login
  document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();  // Evitar que se recargue la página
    document.getElementById('login').style.display = 'block';  // Mostrar modal de login
  });

  // Enlace para abrir el modal de registro
  document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();  // Evitar que se recargue la página
    document.getElementById('register').style.display = 'block';  // Mostrar modal de registro
  });

  // Enlace para abrir el carrito
  document.getElementById('carritoLink').addEventListener('click', (e) => {
    e.preventDefault();  // Evitar que se recargue la página
    document.getElementById('carrito').style.display = 'flex';  // Mostrar carrito
  });

  // Botón para cerrar el modal de login
  document.getElementById('closeLogin').addEventListener('click', (e) => {
    e.preventDefault();  // Evitar recarga si el botón es un enlace
    document.getElementById('login').style.display = 'none';  // Cerrar el modal de login
  });

  // Botón para cerrar el modal de registro
  document.getElementById('closeRegister').addEventListener('click', (e) => {
    e.preventDefault();  // Evitar recarga si el botón es un enlace
    document.getElementById('register').style.display = 'none';  // Cerrar el modal de registro
  });

  // Botón para volver al inicio
  inicioBtn.addEventListener('click', (e) => {
    e.preventDefault();  // Evitar el comportamiento predeterminado
    // Mostrar la sección de inicio y ocultar otras secciones
    productos.style.display = "none";  // Ocultar productos
    hero.style.display = "inline";  // Mostrar el hero
    categoriasContainer.style.display = 'grid';  // Mostrar categorías
  });

  // Para volver al incio
  inicioLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Aplicar estilos
    productos.style.display = "none";
    hero.style.display = "inline";
    categoriasContainer.style.display = 'grid';

  })

  // === Referencias a Formularios y Mensajes de Error ===
  const loginForm = document.getElementById('loginForm'); // Formulario de inicio de sesión
  const registerForm = document.getElementById('registerForm'); // Formulario de registro
  const loginError = document.getElementById('loginError'); // Mensaje de error para inicio de sesión
  const registerError = document.getElementById('registerError'); // Mensaje de error para registro
  const API_BASE_URL = 'https://api.escuelajs.co/api/v1/users'; // URL base de la API para usuarios

  // === Funciones de Manejo de Usuarios ===

  // Función para registrar un usuario
  const registrarUsuario = (email, password, name) => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Obtener usuarios almacenados
    const existeUsuario = usuarios.some(usuario => usuario.email === email); // Verificar si ya existe

    if (existeUsuario) {
      alert('El correo ya está registrado.');
      return false;
    }

    // Crear nuevo usuario y almacenarlo
    const nuevoUsuario = { id: Date.now(), email, password, name };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); // Guardar en localStorage
    alert('¡Usuario registrado con éxito!');
    return true;
  };

  // Función para iniciar sesión
  const iniciarSesion = (email, password) => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Obtener usuarios almacenados
    const usuario = usuarios.find(usuario => usuario.email === email); // Buscar usuario

    if (!usuario) {
      alert('El usuario no existe.');
      return false;
    }

    if (usuario.password !== password) {
      alert('Contraseña incorrecta.');
      return false;
    }

    // Guardar sesión activa
    localStorage.setItem(
      'sesionActiva',
      JSON.stringify({ id: usuario.id, email: usuario.email, name: usuario.name })
    );
    alert(`¡Bienvenido, ${usuario.name}!`);
    return true;
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('sesionActiva'); // Eliminar sesión activa
    alert('Sesión cerrada.');
  };

  // === Manejadores de Formularios ===

  // Manejar el registro de usuarios
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar recarga de la página

    const email = document.getElementById('emailRegister').value;
    const password = document.getElementById('passwordRegister').value;
    const confirmPassword = document.getElementById('confirmPasswordRegister').value;
    const name = 'Usuario'; // Puedes cambiar esto para obtener el nombre desde el formulario

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const registrado = registrarUsuario(email, password, name);
    if (registrado) registerForm.reset(); // Reiniciar formulario
  });

  // Manejar el inicio de sesión
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar recarga de la página

    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const logueado = iniciarSesion(email, password);
    if (logueado) loginForm.reset(); // Reiniciar formulario
  });

  // === Verificar Sesión Activa ===
  const verificarSesionActiva = () => {
    const sesion = JSON.parse(localStorage.getItem('sesionActiva')); // Verificar si hay una sesión activa

    if (sesion) {
      alert(`¡Bienvenido nuevamente, ${sesion.name}!`);
    }
  };

  // Botón para cerrar sesión
  document.getElementById('cerrarSesion')?.addEventListener('click', cerrarSesion);

  // === Inicialización al Cargar la Página ===
  verificarSesionActiva(); // Verificar sesión activa al inicio
  window.addEventListener('scroll', handleScroll); // Manejar scroll infinito
  actualizarCarritoCount(); // Actualizar el contador del carrito

};

// Funcion Default para obtener una imagen cuando recibo una con error
function defaultImage(e) {
  e.target.src = './assets/imgs/noImage.png';
}
