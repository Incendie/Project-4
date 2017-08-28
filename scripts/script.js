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
recommendApp.requestPopcorn = (endpoint, genre) => {
	var request = $.ajax({
		url: `https://tv-v2.api-fetch.website/${endpoint}`,
		method: "GET",
		dataType:"json",
		useCache: true,
		data: {
			genre: `${genre}`
		}
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

//AJAX method for Kitsu
recommendApp.requestKitsu = (genre, offset) => {
	var request = $.ajax({
		url: `https://kitsu.io/api/edge/anime`,
		method: "GET",
		dataType:"json",
		useCache: true,
		headers: {
			"Content-Type": "application/vnd.api+jso",
			Accept: "application/vnd.api+json"
		},
		data: {			
			"page[limit]": "20",
			"filter[genres]": `${genre}`,
			"page[offset]": `${offset*20}`
		}
	});
	return request;
}

//AJAX method for Kitsu
recommendApp.requestKitsuGenre = (uri) => {
	var request = $.ajax({
		url: `${uri}`,
		method: "GET",
		dataType:"json",
		useCache: true,
		headers: {
			"Content-Type": "application/vnd.api+jso",
			Accept: "application/vnd.api+json"
		}	
	});
	return request;
}

//save the amount of time the user says they have to kill
recommendApp.getUserTime = () => {
	recommendApp.userTime = $(".timeSubmit").val();
	console.log("Time to kill:",recommendApp.userTime);		
};

//save the genres that a user enjoys
recommendApp.getUserGenres = () => {
	let themes = [];
	let userInput = $(`input[name="userGenres"]:checked`);
	
	//limit to max 3 genres
	if (userInput.length <=3){
		userInput.each((i,el) => {
			themes.push(el.value);
		});
	}
	else {
		alert("Please check 3 or less genres");
	}
	recommendApp.userGenres = themes;
	console.log("User's genres",recommendApp.userGenres);
};

//grab all movies from Popcorn Time and save the relevant data
recommendApp.getMovies = (genre) => {
	//need: runtime(min), title, trailer(url), compare against genres, images.poster
	let data = []
	console.log("Movie Genre:", genre);
	for(let i=1; i<=recommendApp.maxMovies;i++){
		data.push(recommendApp.requestPopcorn(`movies/${i}`, genre));
	}
	
	$.when(...data).then( ()=>{
		let array = [];

		for (let i=0; i<data.length; i++){
			for(let j=0; j<data[i].responseJSON.length; j++){			
				array.push(data[i].responseJSON[j]);
			}
		}

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
			recommendApp.movies[movie.title].genres = movie.genres;
			
			//movie anime movies to anime object
			// for (j=0; j<recommendApp.movies[movie.title].genres.length; j++){
			// 	if (recommendApp.movies[movie.title].genres[j] === "anime"){
			// 		recommendApp.anime[movie.title] = recommendApp.movies[movie.title];					
			// 		delete recommendApp.movies[movie.title];					
			// 		break;
			// 	}
			// }
		}	
	}).then( ()=> {

	});
};

//grab all TV shows from Popcorn Time and save the relevant data
// recommendApp.getShows = () => {
// 	//need: num_seasons, title, images.poster
// 	for(let i=1; i<=recommendApp.maxShows;i++){
// 		let data = recommendApp.requestPopcorn(`shows/${i}`);
		
// 		$.when(data).then( ()=>{
// 			let array = data.responseJSON;

// 			for (let n=0; n<array.length; n++) {
// 				let shows = array[n]
// 				// console.log(shows);
// 				recommendApp.shows[shows.title] = {};
// 				// recommendApp.shows[shows.title].genres = [];
// 				recommendApp.shows[shows.title].seasons = parseInt(shows.num_seasons);
// 				recommendApp.shows[shows.title].title = shows.title;
// 				recommendApp.shows[shows.title].poster = shows.images.poster;		
// 			}
// 		});
// 	}
// };

//grab all anime from Popcorn Time and save relevant data
recommendApp.getAnime = (genre) => {
	//need: title, type(show/movie), genres(array), images.poster, num_seasons(if available)
	let data = [];
	let gData = [];
	//consistency in naming fix	
	if (genre === "science-fiction"){
		genre = "Sci-Fi";
	}

	if (genre ==="history"){
		genre = "Historical";
	}
	let genreUp = genre.charAt(0).toUpperCase() + genre.slice(1);

	console.log("Anime Genre:", genreUp);
	//see how many requests needed
	recommendApp.requestKitsu(genreUp, 0).then( (res)=> {		
		let lastPage = parseInt(res.links.last.split(`https://kitsu.io/api/edge/anime?filter%5Bgenres%5D=${genreUp}&page%5Blimit%5D=20&page%5Boffset%5D=`).pop());
		for (let i=0; i<=(Math.ceil(lastPage/20)); i++){
			data.push(recommendApp.requestKitsu(genreUp, i));
		}

		// start when all ajax requests complete
		$.when(...data).then( (...res)=>{				
			//save data to anime array, without using for loops
			res.forEach( (result)=> {			
			// console.log(result[0].data);
				result[0].data.forEach( (series)=> {
					// console.log(series);
					if (!series.attributes.nsfw && series.attributes.popularityRank<=10000)	{
						recommendApp.anime[series.attributes.canonicalTitle] = {};
						recommendApp.anime[series.attributes.canonicalTitle].title = series.attributes.canonicalTitle;
						if (series.attributes.posterImage!=null){
							recommendApp.anime[series.attributes.canonicalTitle].poster = series.attributes.posterImage.large;							
						}
						recommendApp.anime[series.attributes.canonicalTitle].episodes = series.attributes.episodeCount;
						recommendApp.anime[series.attributes.canonicalTitle].time = recommendApp.roundShowtime(series.attributes.episodeLength);
						recommendApp.anime[series.attributes.canonicalTitle].genres = [];
						recommendApp.anime[series.attributes.canonicalTitle].genLink = series.relationships.genres.links.related;
						// console.log(series.relationships.genres.links.related);
						recommendApp.anime[series.attributes.canonicalTitle].idNum = series.id;
					}
				});// /forEach series
			}); //forEach result
		}).then( ()=> {
			$(".loading p").text("Picking something special just for you...")
			for (let series in recommendApp.anime){				
				gData.push(recommendApp.requestKitsuGenre(recommendApp.anime[series].genLink));
			}
			
			$.when(...gData).then( (...genRes)=>{				
				genRes.forEach ( (genData)=> {
					for (let series in recommendApp.anime) {
						if (genData[0].links.first.includes(recommendApp.anime[series].idNum.toString())){			
							genData[0].data.forEach( (dataPoint) => {								
								if (!recommendApp.anime[series].genres.includes(dataPoint.attributes.slug)){
									recommendApp.anime[series].genres.push(dataPoint.attributes.slug);
								}
							});													
						}						
						// fixing genre naming consistency
						for (let g=0; g<recommendApp.anime[series].genres.length; g++){
							let gen = recommendApp.anime[series].genres[g];
							if (gen == "historical"){						
								gen = "history";						
							}
							if (gen == "sci-fi"){								
								gen = "science-fiction";
							}
							recommendApp.anime[series].genres[g] = gen.toLowerCase();
						};// /for
					}// /for series
				}); //forEach genData
				console.log("Done")
				$(".loading").css("display", "none");
				$(".showShows").css("display","block");				
			}).fail( ()=> {

			});	
		});//data ajax		
	});
};

recommendApp.displayBest = () => {
	//reset display area, initialize variables
	$(".recommendations").css("display","flex");		
	// $(".showShows").css("display","block");

	$(".animeContainer").empty();	
	$(".movieContainer").empty();

	var randomMovie = "";
	var randomAnime = "";
	//display a random one from only the best matches possible

	//nmovie poster
	for (let i=2; i>=0; i--){
		if (recommendApp.recMovies[i].length) {
			randomMovie = recommendApp.recMovies[i][Math.floor(Math.random()*recommendApp.recMovies[i].length)];
			break;
		}
	}
	let movieTitleString = `${randomMovie}`;
	let movieTrailer = `<div id="movieTrailer"></div>`;
	let movieImage = recommendApp.movies[randomMovie].poster;
	let moviePoster = "";

	//fallback image stating image not found
	if (typeof(movieImage) == undefined){
		moviePoster = `<img src="assets/notFound.png">`
	}
	else{
		moviePoster = `<img src=${movieImage}>`;		
	}

	let movieToAppend = movieTitleString + movieTrailer + moviePoster;
	$(".movie h2").html(movieTitleString);
	$(".movieContainer").append(moviePoster);

	//anime poster
	for (let i=2; i>=0; i--){
		if (recommendApp.recAnime[i].length) {
			randomAnime = recommendApp.recAnime[i][Math.floor(Math.random()*recommendApp.recAnime[i].length)];
			break;
		}
	}

	let animeTitleString = `${randomAnime}`;
	let animeImage = recommendApp.anime[randomAnime].poster;
	let animePoster = "";

	//fallback image stating image not found
	if (typeof(animeImage) == undefined){
		animePoster = `<img src="assets/notFound.png">`
	}
	else{
		animePoster = `<img src=${animeImage}>`;
	}

	let animeToAppend = animeTitleString + animePoster;
	$(".anime h2").html(animeTitleString);
	$(".animeContainer").append(animePoster);
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
	$(".timeToKill").on("submit", (e) => {
		e.preventDefault();
		recommendApp.getUserTime();

		$("html, body").animate({
			scrollTop: $("#forms").offset().top
		}, 1000)
	});

	$(".genresLiked").on("submit", (e) => {
		e.preventDefault();
		$(".loading").css("display","block");
		$(".recommendations").css("display","none");
		$("main").css("display", "block");
		$(".showShows").css("display","none");
		$(".rollShows").css("display","none");

		$("html, body").animate({
			scrollTop: $("main").offset().top
		}, 1000)
		recommendApp.getUserGenres();
		recommendApp.getPopcornData();
	});
	
	$(".showShows").on("click", (e) => {
		e.preventDefault();
		$(".showShows").css("display", "none");
		$(".rollShows").css("display", "block");
		//pass movies, shows, anime, user genres, user time
		recommendApp.getRecommendations(recommendApp.movies, recommendApp.shows, recommendApp.anime, recommendApp.userGenres, recommendApp.userTime);
	});

	$(".rollShows").on("click", (e) => {
		recommendApp.getRecommendations(recommendApp.movies, recommendApp.shows, recommendApp.anime, recommendApp.userGenres, recommendApp.userTime);
	});
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
		if (matches >= 3) {
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

};

//container for getting all recommendations
recommendApp.getRecommendations = (movies, shows, anime, uGenres, uTime) => {
	//recommended movies array reset
	recommendApp.recMovies = [];
	recommendApp.recMovies[0] = [];
	recommendApp.recMovies[1] = [];
	recommendApp.recMovies[2] = [];

	//recommended anime array reset
	recommendApp.recAnime = [];
	recommendApp.recAnime[0] = [];
	recommendApp.recAnime[1] = [];
	recommendApp.recAnime[2] = [];

	recommendApp.getAnimeRecs(anime, uGenres);
	recommendApp.getMovieRecs(movies, uGenres, uTime);
	recommendApp.displayBest();
};

//container for AJAX-ing all data from Popcorn Time
recommendApp.getPopcornData = () => {
	randomAGenre = recommendApp.userGenres[Math.floor(Math.random()*recommendApp.userGenres.length)];
	randomMGenre = recommendApp.userGenres[Math.floor(Math.random()*recommendApp.userGenres.length)];
	recommendApp.getMovies(randomMGenre);
	recommendApp.getAnime(randomAGenre);
};

//rounds a number to the nearest 0.25
recommendApp.roundShowtime = (num) => {
	return (Math.round(num*4)/4);
};

//initialize
recommendApp.init = () => {
	recommendApp.reset();
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
