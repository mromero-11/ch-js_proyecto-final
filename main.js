const ID_DAY = "day";
const ID_TIME = "time";
const ID_TICKETS = "tickets";

class Movie {
    constructor(id, title, image, functions)
    {
        this.id = id;
        this.title = title;
        this.image = image;
        this.functions = functions;
    }
}

class TicketPurchase {
    constructor(name, movie, day, time, tickets, seats)
    {
        this.clientName = name;
        this.selectedMovie = movie;
        this.selectedDay = day;
        this.selectedTime = time;
        this.selectedTickets = tickets;
        this.selectedSeats = seats;
    }
    ClearSelections()
    {
        this.clientName = null;
        this.selectedMovie = null;
        this.selectedDay = null;
        this.selectedTime = null;
        this.selectedTickets = null;
        this.selectedSeats = [];
    }
}

let playingMovies = [];
let ticketPurchase = null;

async function fetchMovies() {
    try {
        const response = await fetch('data/movies.json');
        if (!response.ok) {
            Swal.fire({
                title: 'Info',
                text: 'No encontramos peliculas disponibles.',
                icon: 'info'
              })
        }

        const data = await response.json();
        
        const movies = data.map(movieData => new Movie(
            movieData.id,
            movieData.title,
            movieData.image,
            movieData.functions
        ));
        
        return movies;
    } catch (error) {
        Swal.fire({
            title: 'Info',
            text: 'No encontramos peliculas disponibles.',
            icon: 'info'
          })
    }
}

async function getLocalStorage()
{
    if (!localStorage.getItem("purchase")){
        localStorage.setItem("purchase", JSON.stringify(new TicketPurchase(null, null, null, null, null, [])));
    }

    let purchase = JSON.parse(localStorage.getItem("purchase"));

    ticketPurchase = new TicketPurchase(
        purchase.clientName, 
        purchase.selectedMovie, 
        purchase.selectedDay, 
        purchase.selectedTime, 
        purchase.selectedTickets, 
        purchase.selectedSeats
    );
    
    return ticketPurchase;
}

async function initializeApp() {
    playingMovies = await fetchMovies();
    if (playingMovies === null){
        return;
    }

    ticketPurchase = await getLocalStorage();

    if (ticketPurchase.clientName !== null){
        Swal.fire({
            title: "Tiene una compra en proceso. Desea continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, continuar compra",
            confirmButtonColor: "#3085d6",
            cancelButtonText: "No, iniciar nueva compra",
            cancelButtonColor: "#d33"
          }).then((result) => {
            if (result.isConfirmed) {
                continueWithPurchase();
            }
            else{
                reset();
            }
          });
        continueWithPurchase();
    }
    else {
        showWelcomeMessage();
    }
}

function continueWithPurchase()
{
    showMovies();
    if (ticketPurchase.selectedMovie !== null) selectMovie(ticketPurchase.selectedMovie.id);
    if (ticketPurchase.selectedDay !== null) {
        setDropdownValue(`dropdown-btn-${ID_DAY}`, ticketPurchase.selectedDay);
        selectDay(ticketPurchase.selectedDay);
    }
    if (ticketPurchase.selectedTime !== null) {
        setDropdownValue(`dropdown-btn-${ID_TIME}`, ticketPurchase.selectedTime);
        selectTime(ticketPurchase.selectedTime);
    }
    if (ticketPurchase.selectedTickets !== null) {
        setDropdownValue(`dropdown-btn-${ID_TICKETS}`, ticketPurchase.selectedTickets);
        selectTickets(ticketPurchase.selectedTickets);
    }
}

function showWelcomeMessage() {
    let welcomeDiv = document.getElementById('welcome-message');
    welcomeDiv.innerHTML = `
        <h2>¡Bienvenido a Cines JS!</h2>
        <p>Las mejores peliculas, todos los dias.</p>
        <input type="text" id="client-name" class="form-control my-3 w-25 text-center" placeholder="Por favor ingresa tu nombre">
        <button class="btn btn-primary" onclick="showMovies()">Iniciar</button>
    `;
}

function showMovies() {
    if (ticketPurchase.clientName == null) {
        ticketPurchase.clientName = document.getElementById('client-name').value;
    }
    if (ticketPurchase.clientName == "") {
        alert("Por favor ingresa tu nombre para comenzar.");
        return;
    }

    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));

    document.getElementById('welcome-message').innerHTML = `<p>Hola ${ticketPurchase.clientName}! A continuación te guiaremos por el proceso para comprar entradas.</p>`;
    
    let content = document.getElementById('content');
    content.innerHTML = '<h4>Selecciona una pelicula</h4>';

    content.innerHTML += '<div id="cards-container" class="row row-cols-1 row-cols-md-3"></div>';
    let cardsContainer = document.getElementById('cards-container');

    playingMovies.forEach(movie => {
        cardsContainer.innerHTML += `
            <div class="col">
                <div class="card" onclick="selectMovie(${movie.id})">
                    <img class="card-img-top" src="img/${movie.image}" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                    </div>
                </div>
            </div>
        `;
    });
}

function selectMovie(movieId) {
    ticketPurchase.selectedMovie = playingMovies.find(movie => movie.id === movieId);
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    showFunctions();
    enableDropdown(ID_DAY);
}

function selectDay(day) {
    ticketPurchase.selectedDay = day;
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    populateDropdown(ID_TIME, 'Selecciona un horario', ticketPurchase.selectedMovie.functions.find(func => func.day === day).times, selectTime);
    enableDropdown(ID_TIME);
}

function selectTime(time) {
    ticketPurchase.selectedTime = time;
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    populateDropdown(ID_TICKETS, 'Selecciona cantidad de entradas', Array.from({ length: 4 }, (_, i) => i + 1), selectTickets);
    enableDropdown(ID_TICKETS);
}

function selectTickets(tickets) {
    ticketPurchase.selectedTickets = tickets;
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    showSeatsMap();
}

function updateContentWithDropdown(id, title) {
    let content = document.getElementById('functions-info');
    let dropdownsContainer = document.getElementById('dropdowns-container');
    
    let dropdownDiv = document.createElement('div');
    dropdownDiv.id = `dropdown-${id}`;
    dropdownDiv.className = 'dropdown';

    let dropdownButton = document.createElement('button');
    dropdownButton.id = `dropdown-btn-${id}`;
    dropdownButton.className = 'btn btn-secondary dropdown-toggle disabled';
    dropdownButton.type = 'button';
    dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
    dropdownButton.setAttribute('aria-expanded', 'false');
    dropdownButton.innerText = title;

    dropdownDiv.appendChild(dropdownButton);
    dropdownsContainer.appendChild(dropdownDiv);
    content.appendChild(dropdownsContainer);
}

function populateDropdown(id, title, options, callback)
{
    let dropdownDiv = document.getElementById(`dropdown-${id}`);

    let dropdownButton = document.getElementById(`dropdown-btn-${id}`);
    dropdownButton.innerText = title;

    let oldDropdownMenu = document.getElementById(`dropdown-menu-${id}`);
    if (oldDropdownMenu) {
        oldDropdownMenu.remove();
    }

    let dropdownMenu = document.createElement('ul');
    dropdownMenu.id = `dropdown-menu-${id}`;
    dropdownMenu.className = 'dropdown-menu';

    options.forEach(option => {
        let dropdownListItem = document.createElement('li');
        let dropdownItem = document.createElement('a');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.href = '#';
        dropdownItem.innerText = option;
        dropdownItem.onclick = function(event) {
            event.preventDefault();
            dropdownButton.innerText = option;
            dropdownMenu.classList.remove('show');
            callback(option);
        };
        dropdownListItem.appendChild(dropdownItem);
        dropdownMenu.appendChild(dropdownListItem);
    });

    dropdownDiv.appendChild(dropdownMenu);
}

function enableDropdown(id)
{
    let dropdown = document.getElementById(`dropdown-btn-${id}`);
    dropdown.classList.remove('disabled');
}

function setDropdownValue(dropdownButtonId, value) {
    let dropdownButton = document.getElementById(dropdownButtonId);
    dropdownButton.innerText = value;

    let dropdownMenu = dropdownButton.nextElementSibling;
    let dropdownItems = dropdownMenu.getElementsByClassName('dropdown-item');

    for (let item of dropdownItems) {
        if (item.innerText === value) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }
}

function updateContentWithCard(movieTitle, movieImage)
{
    let movieDiv = document.getElementById('movie-info');
    movieDiv.innerHTML = `
        <div class="card">
            <img class="card-img-top" src="img/${movieImage}" alt="${movieTitle}">
            <div class="card-body">
                <h5 class="card-title">${movieTitle}</h5>
            </div>
        </div>
    `;
}

function showFunctions()
{
    let content = document.getElementById('content');
    content.className = 'mt-5 row justify-content-center';
    content.innerHTML = '';

    let movieDiv = document.createElement('div');
    movieDiv.id = 'movie-info';
    movieDiv.className = 'col-md-3';
    content.appendChild(movieDiv);

    let functionsDiv = document.createElement('div');
    functionsDiv.id = 'functions-info';
    functionsDiv.className = 'col-md-5';
    functionsDiv.innerHTML = `<h4>Selecciona la función y la cantidad de entradas</h4>`;
    functionsDiv.innerHTML += '<div id="dropdowns-container"></div>';
    content.appendChild(functionsDiv);

    updateContentWithCard(ticketPurchase.selectedMovie.title, ticketPurchase.selectedMovie.image);

    updateContentWithDropdown(ID_DAY, 'Selecciona un dia');
    updateContentWithDropdown(ID_TIME, 'Selecciona un horario');
    updateContentWithDropdown(ID_TICKETS, 'Selecciona cantidad de entradas');

    populateDropdown(ID_DAY, 'Selecciona un dia', ticketPurchase.selectedMovie.functions.map(func => func.day), selectDay);
}

function showSeatsMap() {
    let dropdowns = document.getElementById('functions-info');

    let title = document.createElement('h4');
    title.textContent = 'PANTALLA';
    dropdowns.appendChild(title);
    
    let seatsMapDiv = document.createElement('div');
    seatsMapDiv.className = 'seat-map';
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            let seatCheckbox = document.createElement('input');
            seatCheckbox.type = 'checkbox';
            seatCheckbox.className = 'seat-checkbox';
            seatCheckbox.id = `seat-${i}-${j}`;
            seatCheckbox.addEventListener('change', handleSeatSelection);
            seatsMapDiv.appendChild(seatCheckbox);
        }
    }
    
    dropdowns.appendChild(seatsMapDiv);

    let button = document.createElement('button');
    button.className = 'btn btn-primary mt-3';
    button.setAttribute('onclick', 'showSummary()');
    button.textContent = 'Continuar';
    dropdowns.appendChild(button);
}

function handleSeatSelection(event) {
    const selectedSeatId = event.target.id;
    const index = ticketPurchase.selectedSeats.indexOf(selectedSeatId);
    
    if (event.target.checked) {
        if (ticketPurchase.selectedSeats.length < ticketPurchase.selectedTickets) {
            ticketPurchase.selectedSeats.push(selectedSeatId);
            localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
        } else {
            event.target.checked = false;
            Swal.fire({
                icon: "error",
                title: `Solo puede seleccionar ${ticketPurchase.selectedTickets} asientos.`,
                showConfirmButton: false,
                timer: 2000
              });
        }
    } else {
        if (index > -1) {
            ticketPurchase.selectedSeats.splice(index, 1);
            localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
        }
    }
}

function showSummary() {
    let content = document.getElementById('content');
    content.classList.remove('row');
    content.innerHTML = `
        <h3>Resumen</h3>
        <p>Cliente: ${ticketPurchase.clientName}</p>
        <p>Pelicula: ${ticketPurchase.selectedMovie.title}</p>
        <p>Dia: ${ticketPurchase.selectedDay}</p>
        <p>Horario: ${ticketPurchase.selectedTime}</p>
        <p>Tickets: ${ticketPurchase.selectedTickets}</p>
        <p>Asientos: ${ticketPurchase.selectedSeats.join(', ')}</p>
        <button class="btn btn-danger" onclick="reset()">Cancelar</button>
        <button class="btn btn-success" onclick="confirm()">Confirmar</button>
    `;
}

function reset() {
    ticketPurchase.ClearSelections();
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    document.getElementById('content').innerHTML = ``;
    showWelcomeMessage();
}

function confirm() {
    document.getElementById('content').innerHTML = `<h3>Gracias por su compra ${ticketPurchase.clientName}! Disfrute de la pelicula!</h3>`;
    setTimeout(reset, 2000);
    Swal.fire({
        icon: "success",
        title: "Compra confirmada!",
        showConfirmButton: false,
        timer: 1500
      });
}

initializeApp();
