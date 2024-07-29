const ID_DAY = "day";
const ID_TIME = "time";
const ID_TICKETS = "tickets";

const DAYS = ["Jueves", "Viernes", "Sabado", "Domingo"];
const TIMES = ["18:00", "20:00", "22:30"];
const TICKETS = Array.from({ length: 4 }, (_, i) => i + 1);

class Movie {
    constructor(id, title, image)
    {
        this.id = id;
        this.title = title;
        this.image = image;
    }
}

class TicketPurchase {
    constructor()
    {
        this.clientName = null;
        this.selectedMovie = null;
        this.selectedDay = null;
        this.selectedTime = null;
        this.selectedTickets = null;
        this.selectedSeats = [];
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
playingMovies.push(new Movie(1, "Volver al Futuro", "back_to_the_future.jpg"));
playingMovies.push(new Movie(2, "Dia de la Independencia", "independence_day.jpg"));
playingMovies.push(new Movie(3, "John Wick", "john_wick.jpg"));

if (!localStorage.getItem("purchase")){
    localStorage.setItem("purchase", JSON.stringify(new TicketPurchase()));
}

let ticketPurchase = JSON.parse(localStorage.getItem("purchase"));

if (ticketPurchase.clientName !== null){
    continueWithPurchase();
}
else {
    showWelcomeMessage();
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
    enableDropdown(ID_TIME);
}

function selectTime(time) {
    ticketPurchase.selectedTime = time;
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    enableDropdown(ID_TICKETS);
}

function selectTickets(tickets) {
    ticketPurchase.selectedTickets = tickets;
    localStorage.setItem("purchase", JSON.stringify(ticketPurchase));
    showSeatsMap();
}

function createDropdown(id, title, options, callback) {
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
        dropdownMenu.appendChild(dropdownItem);
    });

    dropdownDiv.appendChild(dropdownButton);
    dropdownDiv.appendChild(dropdownMenu);

    return dropdownDiv;
}

function updateContentWithDropdown(id, title, options, callback) {
    let content = document.getElementById('functions-info');
    let dropdownsContainer = document.getElementById('dropdowns-container');
    let dropdown = createDropdown(id, title, options, callback);
    dropdownsContainer.appendChild(dropdown);
    content.appendChild(dropdownsContainer);
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

function updateContentWithCard()
{
    let movieDiv = document.getElementById('movie-info');
    movieDiv.innerHTML = `
        <div class="card">
            <img class="card-img-top" src="img/${ticketPurchase.selectedMovie.image}" alt="${ticketPurchase.selectedMovie.title}">
            <div class="card-body">
                <h5 class="card-title">${ticketPurchase.selectedMovie.title}</h5>
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
    functionsDiv.innerHTML = `<h4>Selecciona dia, horario y cantidad de entradas</h4>`;
    functionsDiv.innerHTML += '<div id="dropdowns-container"></div>';
    content.appendChild(functionsDiv);

    updateContentWithCard();
    updateContentWithDropdown(ID_DAY, 'Selecciona un dia', DAYS, selectDay);
    updateContentWithDropdown(ID_TIME, 'Selecciona un horario', TIMES, selectTime);
    updateContentWithDropdown(ID_TICKETS, 'Selecciona cantidad de entradas', TICKETS, selectTickets);
}

function showSeatsMap() {
    let dropdowns = document.getElementById('functions-info');

    dropdowns.innerHTML += '<h4>PANTALLA</h4>';
    
    let seatsMapDiv = document.createElement('div');
    seatsMapDiv.className = 'seat-map';
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            let seatCheckbox = document.createElement('input');
            seatCheckbox.type = 'checkbox';
            seatCheckbox.className = 'seat-checkbox';
            seatCheckbox.id = `seat-${i}-${j}`;
            seatCheckbox.addEventListener('click', handleSeatSelection);
            seatsMapDiv.appendChild(seatCheckbox);
        }
    }
    
    dropdowns.appendChild(seatsMapDiv);
    dropdowns.innerHTML += '<button class="btn btn-primary mt-3" onclick="showSummary()">Continuar</button>';
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
            alert(`Solo puede seleccionar ${ticketPurchase.selectedTickets} asientos.`);
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
    document.getElementById('content').innerHTML = '';
    showWelcomeMessage();
}

function confirm() {
    document.getElementById('content').innerHTML = `<h3>Gracias por su compra ${ticketPurchase.clientName}! Disfrute de la pelicula!</h3>`;
    setTimeout(reset, 3000);
}
