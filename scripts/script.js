//App "global" container
var recommendApp = {};

	//api keys
	recommendApp.igdbKey = "9ac7414388c61d4eb09467c018656f0b";
	recommendApp.gbKey = "4b37232696ae49c74b6415c56fd1d6675184c747";
	
	//max number of endpoints per category
	recommendApp.maxMovies = 130; 
	recommendApp.maxShows = 41;
	recommendApp.maxAnime = 14;

	//initialize arrays to save data
	recommendApp.movies = {};
	recommendApp.shows = {};
	recommendApp.anime = {};
	// recommendApp.userGenres = [];

//AJAX method for PopcornTime
recommendApp.requestPopcorn = (endpoint) => {
	var request = $.ajax({
		url: `https://tv-v2.api-fetch.website/${endpoint}`,
		method: "GET",
		dataType:"json",
		useCache: true
	});
	return request;
}

//AJAX method for Giant Bomb
recommendApp.requestGiantBomb = (endpoint) => {
	var request = $.ajax({
		url: `http://proxy.hackeryou.com`,
		method: "GET",
		dataType: "json",
		useCache: true,
		data: {
			reqUrl: `http://www.giantbomb.com/api/${endpoint}`,
			params: {
				api_key: recommendApp.gbKey,
				format: "json"
			}
		}
	});
	return request;
}

// //AJAX method for igdbKey
// recommendApp.requestIGDB = (endpoint) => {
// 	var request = $.ajax({
// 		url: `http://proxy.hackeryou.com`,	
// 		method: "GET",
// 		dataType:"json",
// 		data: {
// 			reqUrl: `https://api-2445582011268.apicast.io/${endpoint}`,params: {
// 					fields: "*"
// 				},
// 				proxyHeaders: {
// 					"user-key": recommendApp.igdbKey,
// 					Accept: "applications/json"
// 				}
// 		},		
// 		useCache: true
// 	})
// 	return request;
// }

//save the amount of time the user says they have to kill
recommendApp.getUserTime = () => {
	$(".timeToKill").on("submit", (e) => {
		e.preventDefault();
		recommendApp.userTime = $(".timeSubmit").val();
		console.log("userTime",recommendApp.userTime);
	});
};

//save the genres that a user enjoys
recommendApp.getUserGenres = () => {
	$(".genresLiked").on("submit", (e) => {
		e.preventDefault();
		let themes = [];
		$(`input[name="userGenres"]:checked`).each((i,el) => {
			themes.push(el.value);
		});
		recommendApp.userGenres = themes;
		console.log("Genres",recommendApp.userGenres);
	});
};

//grab all movies from Popcorn Time and save the relevant data
recommendApp.getMovies = () => {
	//need: runtime(min), title, trailer(url), compare against genres, images.poster
	for(let i=1; i<=recommendApp.maxMovies;i++){
		let data = recommendApp.requestPopcorn(`movies/${i}`);
		
		$.when(data).then( ()=>{
			let array = data.responseJSON;

			for (let n=0; n<array.length; n++) {
				let movie = array[n]
				// console.log(movie);
				recommendApp.movies[movie.title] = {};
				// recommendApp.movies[movie.title].genres = [];
				recommendApp.movies[movie.title].runtime = parseInt(movie.runtime);
				recommendApp.movies[movie.title].title = movie.title;
				recommendApp.movies[movie.title].trailer = movie.trailer;
				recommendApp.movies[movie.title].poster = movie.images.poster;
				recommendApp.movies[movie.title].genres = movie.genres
				recommendApp.movies[movie.title].page = i;		
			}
		});
	}
};

//grab all TV shows from Popcorn Time and save the relevant data
recommendApp.getShows = () => {
	//need: num_seasons, title, images.poster
	for(let i=1; i<=recommendApp.maxShows;i++){
		let data = recommendApp.requestPopcorn(`shows/${i}`);
		
		$.when(data).then( ()=>{
			let array = data.responseJSON;

			for (let n=0; n<array.length; n++) {
				let shows = array[n]
				// console.log(shows);
				recommendApp.shows[shows.title] = {};
				// recommendApp.shows[shows.title].genres = [];
				recommendApp.shows[shows.title].seasons = parseInt(shows.num_seasons);
				recommendApp.shows[shows.title].title = shows.title;
				recommendApp.shows[shows.title].poster = shows.images.poster;		
			}
		});
	}
};

//grab all anime from Popcorn Time and save relevant data
recommendApp.getAnime = () => {
	//need: title, type(show/movie), genres(array), images.poster, num_seasons(if available)
	for(let i=1; i<=recommendApp.maxMovies;i++){
		let data = recommendApp.requestPopcorn(`animes/${i}`);
		
		$.when(data).then( ()=>{
			let array = data.responseJSON;

			for (let n=0; n<array.length; n++) {
				let movie = array[n]
				// console.log(movie);
				recommendApp.anime[movie.title] = {};
				// recommendApp.anime[movie.title].genres = [];
				recommendApp.anime[movie.title].seasons = parseInt(movie.num_seasons);
				recommendApp.anime[movie.title].title = movie.title;
				recommendApp.anime[movie.title].poster = movie.images.poster;
				recommendApp.anime[movie.title].genres = movie.genres
			}
		});
	}
};

//initialize
recommendApp.init = () => {
	// recommendApp.getList();
	// recommendApp.getUserTime();
	// recommendApp.getUserGenres();
	recommendApp.getMovies();
	recommendApp.getShows();
	recommendApp.getAnime();
};

//document ready
$(function() {
	recommendApp.init();
});
// animeList.objectSize = function(obj) {
//     var size = 0, key;
//     for (key in obj) {
//         if (obj.hasOwnProperty(key)) size++;
//     }
//     return size;
// };