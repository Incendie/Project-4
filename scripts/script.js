//App "global" container
var recommendApp = {};

	//api keys
	recommendApp.igdbKey = "9ac7414388c61d4eb09467c018656f0b";
	recommendApp.gbKey = "4b37232696ae49c74b6415c56fd1d6675184c747";
	
	//max number of endpoints per category
	recommendApp.maxMovies = 130; 
	recommendApp.maxShows = 41;
	recommendApp.maxAnime = 14;

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
		console.log("Time to kill:",recommendApp.userTime);
	});
};

//save the genres that a user enjoys
recommendApp.getUserGenres = () => {
	$(".genresLiked").on("submit", (e) => {
		e.preventDefault();
		let themes = [];
		let userInput = $(`input[name="userGenres"]:checked`);
		
		//limit to max 3 genres
		if (userInput.length <=3){
			userInput.each((i,el) => {
				themes.push(el.value);
			});
		}
		else {
			alert("Please only check 3 or less genres");
		}
		recommendApp.userGenres = themes;
		console.log("User's genres",recommendApp.userGenres);

		//pass movies, shows, anime, user genres, user time
		recommendApp.getRecommendations(recommendApp.movies, recommendApp.shows, recommendApp.anime, recommendApp.userGenres, recommendApp.userTime);
	});
};

//grab all movies from Popcorn Time and save the relevant data
recommendApp.getMovies = () => {
	//need: runtime(min), title, trailer(url), compare against genres, images.poster
	for(let i=1; i<=recommendApp.maxMovies;i++){
		let data = recommendApp.requestPopcorn(`movies/${i}`);
		
		$.when(data).then( ()=>{
			let array = data.responseJSON;

			//saving the relevant datas
			for (let n=0; n<array.length; n++) {
				let movie = array[n]
				// console.log(movie);
				recommendApp.movies[movie.title] = {};
				// recommendApp.movies[movie.title].genres = [];
				recommendApp.movies[movie.title].runtime = recommendApp.roundShowtime(parseInt(movie.runtime)/60);
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
	for(let i=1; i<=recommendApp.maxAnime;i++){
		let data = recommendApp.requestPopcorn(`animes/${i}`);
		
		$.when(data).then( ()=>{
			let array = data.responseJSON;

			for (let n=0; n<array.length; n++) {
				let series = array[n]
				// console.log(movie);
				recommendApp.anime[series.title] = {};
				// recommendApp.anime[movie.title].genres = [];
				recommendApp.anime[series.title].seasons = parseInt(series.num_seasons);
				recommendApp.anime[series.title].title = series.title;
				recommendApp.anime[series.title].poster = series.images.poster;
				recommendApp.anime[series.title].genres = series.genres
			}

			for (let series in recommendApp.anime) {
				for (let n=0; n<recommendApp.anime[series].genres.length; n++) {
					recommendApp.anime[series].genres[n] = recommendApp.anime[series].genres[n].toLowerCase();
					if (recommendApp.anime[series].genres[n] == "sci-fi") {
						recommendApp.anime[series].genres[n] = "science-fiction";
					}
				}
			}
		});
	}
};

//container for getting all recommendations
recommendApp.getRecommendations = (movies, shows, anime, uGenres, uTime) => {

	recommendApp.getMovieRecs(movies, uGenres, uTime);
	recommendApp.getAnimeRecs(anime, uGenres);
	recommendApp.displayBest();
};

recommendApp.displayBest = () => {
	//display only the best matches possible
	for (let i=2; i>0; i--){
		if (recommendApp.recMovies[i].length) {
			var randomMovie = recommendApp.recMovies[i][Math.floor(Math.random()*recommendApp.recMovies.length)];
			break;
		}
	}
	console.log(randomMovie);

	for (let i=2; i>0; i--){
		if (recommendApp.recAnime[i].length) {
			var randomAnime = recommendApp.recAnime[i][Math.floor(Math.random()*recommendApp.recAnime.length)];
			break;
		}
	}
	console.log(randomAnime);
}

//get movie recommendations
recommendApp.getMovieRecs = (movies, uGenres, uTime) => {
	//finding out how well each movie matches
	for (let movie in movies) {
		let matches = 0;

		//must fit within user's timeframe
		if (movies[movie].runtime <= uTime){
			//checking for how well genres match
			for (let i=0; i<uGenres.length; i++){
				for (let n=0; n<movies[movie].genres.length; n++) {
					if (uGenres[i] === movies[movie].genres[n]){
						matches++;
					}
				}//for movie.genres
			}//for uGenres
		}//if

		//breaking up movies to how close they match the user
		if (matches === 3) {
			recommendApp.recMovies[2].push(movies[movie].title);
		}
		else if (matches === 2) {
			recommendApp.recMovies[1].push(movies[movie].title);
		}
		else if (matches === 1) {
			recommendApp.recMovies[0].push(movies[movie].title);
		}
	}
	console.log("Recommended Movies:",recommendApp.recMovies);
}

//container for getting user input
recommendApp.getUserInput = () => {
	recommendApp.getUserTime();
	recommendApp.getUserGenres();
};

//get anime recommendations
recommendApp.getAnimeRecs = (anime, uGenres) => {
	//finding out how well each movie matches
	for (let series in anime) {
		let matches = 0;

		//checking for how well genres match
		for (let i=0; i<uGenres.length; i++){
			for (let n=0; n<anime[series].genres.length; n++) {
				if (uGenres[i] === anime[series].genres[n]){
					matches++;
				}
			}//for anime.genres
		}//for uGenres


		//breaking up movies to how close they match the user
		if (matches === 3) {
			recommendApp.recAnime[2].push(anime[series].title);
		}
		else if (matches === 2) {
			recommendApp.recAnime[1].push(anime[series].title);
		}
		else if (matches === 1) {
			recommendApp.recAnime[0].push(anime[series].title);
		}
	}
	console.log("Recommended Anime:",recommendApp.recAnime);
}

//container for AJAX-ing all data from Popcorn Time
recommendApp.getPopcornData = () => {
	recommendApp.getMovies();
	recommendApp.getShows();
	recommendApp.getAnime();	
};

//rounds a number to the nearest 0.25
recommendApp.roundShowtime = (num) => {
	return (Math.round(num*4)/4);
};

//initialize
recommendApp.init = () => {
	recommendApp.reset();
	recommendApp.getPopcornData();
	recommendApp.getUserInput();
};

recommendApp.reset = () => {
	//initialize arrays/objects for saving data
	recommendApp.movies = {};
	recommendApp.shows = {};
	recommendApp.anime = {};

	//recommended movies array
	recommendApp.recMovies = [];
	recommendApp.recMovies[0] = [];
	recommendApp.recMovies[1] = [];
	recommendApp.recMovies[2] = [];

	//recommended anime array
	recommendApp.recAnime = [];
	recommendApp.recAnime[0] = [];
	recommendApp.recAnime[1] = [];
	recommendApp.recAnime[2] = [];

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