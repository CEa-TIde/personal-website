// Made for Redlib (alt. reddit frontend)
// specifically: https://redlib.catsarch.com/info

// sorttags() and sortwords() use the output of parsepages()


function parseposts(el) {
  let res = [];
    let posts = el.querySelectorAll(".post");
  for (let post of posts) {
    let author = post.querySelector(".post_header > .post_author")?.innerText;
    let tag = post.querySelector(".post_title > .post_flair span")?.innerText;
    let _d = post.querySelector(".post_header > .created")?.title;
    let date = _d == null ? null : Date.parse(_d);
    let _l = post.querySelector(".post_title > a:not(.post_flair)");
        let title = _l?.innerText;
    let url = _l?.href;
    let body_preview = post.querySelector(".post_body")?.innerHTML;
    res.push({
      author: author,
      date: date,
      tag: tag || "Untagged",
      title: title,
      url: url,
      body_preview: body_preview,
    });
  }
  return res;
}

async function loadpage(url) {
  let container = document.querySelector("#parse-docker");
  if (!container) {
    container = document.createElement("DIV");
    container.id = "parse-docker";
    document.body.appendChild(container);
  }
  let response = await fetch(url);
  container.innerHTML = await response.text();
}

function getnexturl(el) {
  return el.querySelector('footer a[accesskey="N"]')?.href;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// fetches and parses `limit` amount of pages.
// immediately returns with current results if urlnext is invalid.
async function parsepages(limit) {
  let mainpostsdom = document.querySelector("#posts");
  let parsedPosts = parseposts(mainpostsdom);
  let urlnext = getnexturl(document.body);
  while (limit > 1) {
    console.log(urlnext);
    await loadpage(urlnext);
    let docker = document.querySelector("#parse-docker");
    let newposts = parseposts(docker);
    parsedPosts = parsedPosts.concat(newposts);
    limit--;
    urlnext = getnexturl(docker);
    if (!urlnext) break;
    await sleep(1000 * 1);
  }
  return parsedPosts;
}

function sorttags(data) {
    let tags = {};
    for (post of data) {
        let tag = post.tag;
        if (!tags[tag]) {
            tags[tag] = [];
        }
        tags[tag].push(post);
    }
    return tags;
}

var femwords =  ["mtf", "transgirl", "trans girl", "transfem", "trans fem", "tgirl", /*"transfeminine", "trans-feminine", "trans feminine",*/ "feminine", 
    "trans woman", "transwoman", "trans women", "transwomen", "estrogen", "estradiol", " e ", "vaginoplasty", "misgendered her"];
var mascwords = ["ftm", "transguy", "trans guy", "transmasc", "trans masc", "tboy", /*"transmasculine", "trans-masculine", "trans masculine",*/ "masculine", 
    "trans man", "transman", "trans men", "transmen", "testosterone", " t ", "phalloplasty", "misgendered him"];
var nbwords =   ["ftnb", "mtnb", "enby", " nb", "nonbinary", "non binary", "non-binary", "agender", "bigender"];

function checkwords(wordlist, postbody, posttitle) {
    for (word of wordlist) {
        if (postbody.includes(word)) return true;
        if (posttitle.includes(word)) return true;
    }
    return false;
}

function sortwords(data) {
    console.log(data.length);
    let excludetags = ['Trans Masculine', 'Trans Feminine', 'Non Binary']; // already explicitly tagged.
    let femposts = [];
    let mascposts = [];
    let nbposts = [];
    let femmascposts = [];
    let femnbposts = [];
    let mascnbposts = [];
    let allposts = [];
    let restposts = [];
    let foundposts = [];
    for (post of data) {
        let tag = post.tag;
        if (!excludetags.includes(tag)) {
            let body_preview = post.body_preview.toLowerCase();
            let title = post.title.toLowerCase();
            let foundfem = checkwords(femwords, body_preview, title);
            let foundmasc = checkwords(mascwords, body_preview, title);
            let foundnb = checkwords(nbwords, body_preview, title);
            if (foundfem && !foundmasc && !foundnb) {
                femposts.push(post);
            }
            else if (!foundfem && foundmasc && !foundnb) {
                mascposts.push(post);
            }
            else if (!foundfem && !foundmasc && foundnb) {
                nbposts.push(post);
            }
            else if (foundfem && foundmasc && !foundnb) {
                femmascposts.push(post);
            }
            else if (foundfem && !foundmasc && foundnb) {
                femnbposts.push(post);
            }
            else if (!foundfem && foundmasc && foundnb) {
                mascnbposts.push(post);
            }
            else if (foundfem && foundmasc && foundnb) {
                allposts.push(post);
            }

            if (!(foundfem || foundmasc || foundnb)) restposts.push(post);
            else foundposts.push(post);

        }
    }
    return {
        fem: femposts,
        masc: mascposts,
        nb: nbposts,
        femmasc: femmascposts,
        femnb: femnbposts,
        mascnb: mascnbposts,
        all: allposts,
        rest: restposts,
        found: foundposts,
    }
}
