"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_MAZE_API_URL = "http://api.tvmaze.com";
const MISSING_IMG_URL = "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  //take term and make request to TV show API for object

  const shows = await axios.get(`${TV_MAZE_API_URL}/search/shows`, { params: { q } });
  const showList = [];

  for (let result of shows.data) {
    let show = {
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image ? result.show.image.medium : MISSING_IMG_URL
    };

    showList.push(show);
  }
  return showList;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name} poster"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {

  const episodes = await axios.get(`${TV_MAZE_API_URL}/shows/${id}/episodes`);
  console.log(episodes);

  const episodeList = [];

  for (let result of episodes.data) {
    let episode = {
      id: result.id,
      name: result.name,
      season: result.season,
      number: result.number
    };

    episodeList.push(episode);
  }
  return episodeList;
}

/**Given list of episodes, create list for DOM  */

function populateEpisodes(episodes) {
  $episodesArea.show();

  const $episodesList = $("#episodesList");

  //loop through episodes array and
  //add each as a list element with name, season and episode number

  for (let episode of episodes) {
    $episodesList
      .append(`<li> ${episode.name}(Season: ${episode.season}, Episode: ${episode.number} </li>`);
  }
}

/** Callback funtion for creating an episode list */

async function findEpisodesAndList(event) {
  // const showId = $(event.target).parent().parent().parent().data().showId;
  const showId = $(event.target).closest(".Show").data().showId;
  console.log("Show ID is :", showId);
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", "button", findEpisodesAndList);
