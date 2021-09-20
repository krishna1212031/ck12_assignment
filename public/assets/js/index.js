//ll data for the accordian chapter && lesson
let data; // all data for the accordian chapter && lesson
let baseUrl; //base url

//generic function to reuse..................................................................

//used it to fetch data
const getData = (url) => {
  return fetch(url).then((res) => res.json());
};

//used it to create list items
const createLiEl = (item, el) => {
  let li = document.createElement("li");
  li.id = item.id;

  li.className = "panel";
  if (item.childrenCount){
    li.classList.add("chapter");
  }

  el.appendChild(li);
  return li;
};

//used it to create icons
const createIcon = (parent, item) => {
  let icon = document.createElement("i");

  if (item.type === "chapter") {
    icon.className = "fa fa-chevron-right";
  }
  parent.appendChild(icon);
};

//title creator for the list
const createTitle = (parent, item, firstIndex) => {
  let title = document.createElement("div");

  title.className = "title";

  title.innerText =
    (firstIndex ? firstIndex + "." : "") + item.sequenceNO + ". " + item.title;

  parent.appendChild(title);
};

//used it to create progress div
const createProgress = (parent, item) => {
  let progress = document.createElement("div");

  progress.className = "progress";
  // it is checking for the type - chapter or lesson
  if (item.type === "chapter") {
    progress.innerText = item.completeCount + " / " + item.childrenCount;
    if (item.completeCount === 0) {
      progress.classList.add("not_started");
    } else if (item.completeCount === item.childrenCount) {
      progress.classList.add("complete");
    } else {
      progress.classList.add("in_progress");
    }
  } else {
    let className = item.status.toLowerCase();
    let status = className.split("_").join(" ");
    progress.innerText = status;
    progress.classList.add(className);
  }

  parent.appendChild(progress);
};

// used it to create loader
const createLoader = (parent) => {
  const loader = document.createElement("div");
  loader.className = "loader";
  parent.appendChild(loader);
  return loader;
};

//used it to create panel for the list
const createPanel = (item, list, firstIndex) => {
  if (firstIndex === undefined) {
    createIcon(list, item);
  }
  createTitle(list, item, firstIndex);
  createProgress(list, item);
};

//used to create first level of chapter or
const createFirstLvlEl = (item, list) => {
  let liEl = createLiEl(item, list);
  
  createPanel(item, liEl);

  if (item.type === "chapter") {
    let li = document.createElement("li");
    li.className = "acc";
    list.appendChild(li);
    const acc = document.createElement("ol");
    li.appendChild(acc);
  }
};

// it is used to create sec level elements
const createSecLvlEl = (item, list, firstIndex) => {
  let liEl = createLiEl(item, list);
  createPanel(item, liEl, firstIndex);
};

//Handlers ..................................................................................

//it is used to handle first level events
let handleFirstLevelClick = (el) => {
  el.onclick = (e) => {
    if (e.target.classList.contains("chapter")) {
      let id = e.target.id;
      let type = data.find((item) => id == item.id).type;

      // Adding memo/children in data in correct index
      let currentChapterIndex = data.findIndex((item) => id == item.id);
      let lesson = data[currentChapterIndex].lesson;

      //check - Do we need to call second level API
      if (type === "chapter" && lesson === undefined) {
        getSecondLevel(
          id,
          currentChapterIndex,
          e.target.nextSibling.childNodes[0]
        );
        data[currentChapterIndex].lesson = [];
      }

      if (type === "chapter") {
        if (e.target.classList.contains("open")) {
          e.target.classList.remove("open");
          e.target.nextSibling.classList.remove("open");
        } else {
          e.target.classList.add("open");
          e.target.nextSibling.classList.add("open");
        }
      }
    }
  };
};
// it is used to sort the list based on sequence no.
const sortOnSeqNo = (firstEl, secEl) => firstEl.sequenceNO - secEl.sequenceNO;

//fetching data..............................................................................

//it is used to fetch first level of the list
const getFirstLevel = (list) => {
  const loader = createLoader(list);

  getData(baseUrl).then((res) => {
    loader.remove();

    data = res.response;
    data.sort(sortOnSeqNo).forEach((item) => {
      createFirstLvlEl(item, list);
    });
  });
};

//it is used to fetch second level of the list
const getSecondLevel = (id, i, list) => {
  let url = baseUrl + "/section/" + id;

  const li = document.createElement("li");
  createLoader(li);
  list.appendChild(li);

  getData(url).then((res) => {
    li.remove();

    const currentChapterLessons = res.response[id].sort(sortOnSeqNo);

    data[i].lesson = currentChapterLessons;
    data[i].lesson.forEach((lesson) =>
      createSecLvlEl(lesson, list, data[i].sequenceNO)
    );
  });
};

//initializaton..............................................................................
function init() {
  let books = document.getElementById("books");

  const path = location.pathname.split("/");
  baseUrl = "/api/book/" + path[path.length - 1];

  getFirstLevel(books);
  handleFirstLevelClick(books);
}

init();
