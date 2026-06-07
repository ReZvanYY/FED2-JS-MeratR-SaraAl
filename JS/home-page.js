
if (!token) {
  throw new Error("unable to find the token, user not signed in.");
}

//Fetch current user from the localStorage
const currentUser = JSON.parse(localStorage.getItem("user"));

//API URL
const postsApiUrl = "https://v2.api.noroff.dev/social/posts?_author=true&_comments=true";
const apiKeyStorage = "apiKey";

// the function that checks if the user is signed in or not
function isSignedIn() {
  return !!token;
}

// checking if the user is signed in or not
if (!isSignedIn()) {
  window.location.href = "/HTML/sign-in-page.html";
}

//API key dynamic Generation
async function getApiKey() {
  let apiKey = localStorage.getItem(apiKeyStorage);
  if (apiKey) return apiKey;
  if (!token) throw new Error("User not signed in");

  try {
    const apiKeyResponse = await fetch(
      "https://v2.api.noroff.dev/auth/create-api-key",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!apiKeyResponse.ok) throw new Error("Failed to generate API Key");

    const apiKeyResult = await apiKeyResponse.json();

    apiKey = apiKeyResult.data.key;
    localStorage.setItem(apiKeyStorage, apiKey);
    return apiKey;
  } catch (errorMessage) {
    console.error("Error creating API key: ", errorMessage);
    throw errorMessage;
  }
}

let userPosts = [];

//Fetch Posts from the API
async function fetchPosts() {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(postsApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) throw new Error("failed to fetch posts");
    const result = await response.json();

    userPosts = result.data || [];
    renderPosts();
  } catch (error) {
    displayArea.innerHTML = `<p class="text-red-700">Failed to load posts, please refresh the page (CTRL + R or CMD + R)</p>`;
    console.error(error);
  }
}

// Connect to the html elements
const postTitleInput = document.getElementById("title");
const searchInput = document.getElementById("search");
const displayArea = document.getElementById("displayed-post");
const newPostButton = document.getElementById("create-a-new-post");
newPostButton.setAttribute("aria-expanded", "false");
newPostButton.setAttribute("aria-controls", "post-form-container");
const postForm = document.getElementById("post-form");
const postContentInput = document.getElementById("post-content");

const postFormContainer = document.getElementById("post-form-container");
postFormContainer.classList.add("hidden");
postFormContainer.setAttribute("aria-hidden", "true");

// Generation of a unique ID for each post, by taking the timestamp + a random number
function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}
async function handleEdit(post, postContent, container) {
  const textArea = document.createElement("textarea");
  textArea.value = post.body;
  textArea.className = "w-full border p-2 mb-2 mt-2";

  container.replaceChild(textArea, postContent);

  const addSaveButton = document.createElement("button");
  addSaveButton.textContent = "SAVE";
  addSaveButton.className =
    "bg-[#B56F76] border-2 border-black text-black font-montserrat font-bold rounded-md p-2 mt-4 hover:bg-[#b56472] cursor-pointer";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "CANCEL";
  cancelButton.className =
    "bg-red-500 border-2 border-black text-black font-montserrat font-bold rounded-md p-2 mt-4 hover:bg-red-300 cursor-pointer";

  const actionButtonContainer = document.createElement("div");
  actionButtonContainer.className = "flex gap-2 mt-4 mb-4";

  actionButtonContainer.appendChild(addSaveButton);
  actionButtonContainer.appendChild(cancelButton);
  container.appendChild(actionButtonContainer);

  addSaveButton.addEventListener("click", async () => {
    const updateBodyContent = textArea.value.trim();
    if (!updateBodyContent) return alert("Content cannot be empty");

    try {
      const apiKey = await getApiKey();
      const response = await fetch(
        `https://v2.api.noroff.dev/social/posts/${post.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({
            title: post.title,
            body: updateBodyContent,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update post");
      fetchPosts();

    } catch (error) {
      alert("Error updating post: " + error.message);
      console.error(error);
    }
  });

  cancelButton.addEventListener("click", () => {
    container.replaceChild(postContent, textArea);
    actionButtonContainer.remove();
  });
}

async function deletePost(postId) {
  if (
    !confirm(
      "Do you wish to delete this post? This post will be permantly deleted."
    )
  )
    return;

  try {
    const apiKey = await getApiKey();
    const response = await fetch(`https://v2.api.noroff.dev/social/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) throw new Error("Failed to delete the post!");
    fetchPosts();
  } catch (error) {
    alert("Error deleting post: " + error.message);
    console.error(error);
  }
}

// function for displaying the posts.
function renderPosts(postsToRender = userPosts) {
  displayArea.innerHTML = ""; //clear out all previous elements.

  if (postsToRender.length === 0) {
    displayArea.textContent = "No Post Found";
    displayArea.className = "text-center text-[2rem]";
    displayArea.style.color = "red";
  } else {
    displayArea.className = "text-[1.25rem]";
    displayArea.style.color = "black";
  }
  // Dynamically adding the elements needed for the posts as they get posted.
  postsToRender.forEach((post) => {
    const articleElementForPost = document.createElement("article");
    articleElementForPost.className =
      "p-4 m-8 rounded-lg bg-[#FFE9CC] shadow-xl";
    articleElementForPost.setAttribute("role", "article");
    articleElementForPost.setAttribute("aria-label", `Post by ${post.author?.name || "unknown author"}`);

    const userInfoElement = document.createElement("div");
    userInfoElement.className = "flex items-center gap-2 mb-2";
    userInfoElement.setAttribute("role", "group");
    userInfoElement.setAttribute("aria-label", "Post author information");

    const profileLink = document.createElement("a");
    profileLink.href = `/HTML/user-page.html?name=${post.author?.name}`;
    profileLink.className = "flex items-center gap-2 hover:underline";
    profileLink.setAttribute("aria-label", `View profile of ${post.author?.name || "author"}`);

    const userProfileImage = document.createElement("img");
    userProfileImage.src =
      post.author?.avatar?.url || "https://i.imghippo.com/files/ZyN1996XVE.png";
    userProfileImage.alt = `${post.author?.name} profile picture`;
    userProfileImage.className = "w-16 h-16 rounded-full";

    const userName = document.createElement("p");
    userName.textContent = post.author?.name;
    userName.className = "font-bold text-[1.2rem]";

    profileLink.appendChild(userProfileImage);
    profileLink.appendChild(userName);

    userInfoElement.appendChild(profileLink);

    const postTitle = document.createElement("h3");
    postTitle.id = `post-title-${post.id}`;
    postTitle.textContent = post.title || "Quick Post";
    postTitle.className = "font-bold text-xl mb-4";

    articleElementForPost.setAttribute("aria-labelledby", postTitle.id);

    const postContent = document.createElement("p");
    postContent.textContent = post.body;
    postContent.className = "mb-2";
    postContent.setAttribute("aria-label", "Post body");

    const link = document.createElement("a");
    link.href = `/HTML/post-specific-page.html?id=${post.id}`;
    link.textContent = "See Post";
    link.className = "text-blue-600 hover:underline";
    link.setAttribute("aria-label", `View full post titled ${post.title || "Quick Post"}`);

    let userHasLikedThisPost = post.reactions?.some((reaction) => reaction.symbol === "❤️" && reaction.count > 0);

    let likes = post._count.reactions || 0;

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.textContent = `❤️${likes}`;
    likeButton.className = `mt-2 mb-2 px-2 py-1 rouded-md ${userHasLikedThisPost ? "bg-red-500 text-white" : "bg-transparent"}`;
    likeButton.setAttribute("aria-label", `Like this post. ${likes} likes.`);
    likeButton.setAttribute("aria-pressed", String(userHasLikedThisPost));

    likeButton.addEventListener("click", async () => {
      try {
        const apiKey = await getApiKey();
        const response = await fetch(`https://v2.api.noroff.dev/social/posts/${post.id}/react/❤️`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
        });
        if (!response.ok) throw new Error("Failed to react to post");

        const result = await response.json();
        likes = result.data.reactions.find(r => r.symbol === "❤️")?.count || 0;

        userHasLikedThisPost = !userHasLikedThisPost;

        likeButton.textContent = `❤️${likes}`;
        likeButton.className = `mt-2 mb-2 px-2 py-1 rounded-md ${userHasLikedThisPost ?  "bg-transparent" : "bg-transparent"}`;
        likeButton.setAttribute("aria-label", `Like this post. ${likes} likes.`);
        likeButton.setAttribute("aria-pressed", String(userHasLikedThisPost));
      } catch (error) {
        alert("Error reacting to post", + error.message);
        console.error(error);
      }
    });
    articleElementForPost.appendChild(likeButton);
    
    
    if (post.author?.name === currentUser.name) {
      const interactiveButtonContainer = document.createElement("div");
      interactiveButtonContainer.className = "flex gap-2 mt-4 mb-4";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "EDIT POST";
      editButton.id = "edit-button";
      editButton.className = "px-2 py-1 bg-yellow-500 rounded-xl border-2 border-black";
      editButton.setAttribute("aria-label", `Edit post titled ${post.title || "Quick Post"}`);
      editButton.addEventListener("click", () =>
        handleEdit(post, postContent, articleElementForPost)
      );
      
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "DELETE POST";
      deleteButton.id = "delete-button";
      deleteButton.className = "px-2 py-1 bg-red-500 text-white rounded-xl border-2 border-black";
      deleteButton.setAttribute("aria-label", `Delete post titled ${post.title || "Quick Post"}`);
      deleteButton.addEventListener("click", () => deletePost(post.id));
      
      interactiveButtonContainer.appendChild(editButton);
      interactiveButtonContainer.appendChild(deleteButton);

      articleElementForPost.appendChild(interactiveButtonContainer);
    }

    articleElementForPost.appendChild(userInfoElement);
    articleElementForPost.appendChild(postTitle);
    articleElementForPost.appendChild(postContent);
    articleElementForPost.appendChild(link);
    
    displayArea.appendChild(articleElementForPost);
    
    const commentSection = document.createElement("div");
    commentSection.setAttribute("role", "region");
    commentSection.setAttribute("aria-label", "Comments section");
    articleElementForPost.appendChild(commentSection);
    renderComments(post, commentSection);
  });
}
// Toggle the post form
newPostButton.addEventListener("click", () => {
  if (postFormContainer.classList.contains("hidden")) {
    postFormContainer.classList.remove("hidden");
    postFormContainer.setAttribute("aria-hidden", "false");
    newPostButton.setAttribute("aria-expanded", "true");
  } else {
    postFormContainer.classList.add("hidden");
    postFormContainer.setAttribute("aria-hidden", "true");
    newPostButton.setAttribute("aria-expanded", "false");
  }
});

// Render Comments
async function renderComments(post, container){
  container.innerHTML = "";

  const commentList = document.createElement("div");
  commentList.className = "mt-2";
  commentList.setAttribute("role", "list");

  if(post.comments?.length > 0){
    post.comments.forEach((comment) => {
      const commentItem = document.createElement("p");
      commentItem.textContent = `${comment.author?.name || comment.owner} : ${comment.body}`;
      commentItem.className = "border-b py-1"
      commentItem.setAttribute("role", "listitem");
      commentList.appendChild(commentItem);
    });
  } else {
    const noComment = document.createElement("p");
    noComment.textContent = "No comments yet";
    noComment.className = "border-b py-1";
    noComment.setAttribute("aria-live", "polite");
    commentList.appendChild(noComment);
  }

  const commentInput = document.createElement("input");
  commentInput.type = "text";
  commentInput.id = `comment-input-${post.id}`;
  commentInput.placeholder = "Add a new comment";
  commentInput.className = "px-2 py-1 ml-2 rounded border-2 rounded-xl bg-gray-100 border-black mt-4 placeholder:text-gray-600 w-[50%] text-center ";
  commentInput.setAttribute("aria-label", "Add a comment");

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.textContent = "COMMENT";
  submitButton.className = "px-2 py-1 ml-2 rounded-lg bg-[#E94E77] font-semibold border-2 hover:bg-[#e293a8] cursor-pointer";
  submitButton.setAttribute("aria-label", "Submit comment");

  submitButton.addEventListener("click", async () => {
    let commentText = commentInput.value.trim();
    if(!commentText) return;
    
    try {
      const apiKey = await getApiKey();
      const response = await fetch(
        `https://v2.api.noroff.dev/social/posts/${post.id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({ body: commentText }),
        });
      
        if(!response.ok) throw new Error("Unable to post comment");

        commentInput.value = "";
        fetchPosts();
      }catch(error){
        alert("Error commenting: ", + error.message);
        console.error(error);
      }
   
  });
  container.appendChild(commentList);
  container.appendChild(commentInput);
  container.appendChild(submitButton);
}

// Submit a new post
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = postContentInput.value.trim();
  const title = postTitleInput.value.trim();

  if (!token) return alert("You must be signed in to post");
  if (!content) return alert("Please enter some content");
  if (!title) return alert("Please a fitting title");

  const newPost = {
    title: title,
    body: content,
  };
  try {
    const apiKey = await getApiKey();
    const response = await fetch(postsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(newPost),
    });
    if (!response.ok) throw new Error("Failed to post");

    postContentInput.value = "";
    postTitleInput.value = "";
    //Reload the posts after a new post.
    fetchPosts();
  } catch (err) {
    alert("Error Posting: " + err.message);
    console.error(err);
  }
});
// search functionality.
searchInput.addEventListener("input", (e) => {
  const searchQuery = e.target.value.toLowerCase();
  const filteredPosts = userPosts.filter(
    (post) =>
      post.body.toLowerCase().includes(searchQuery) ||
      post.author?.name.toLowerCase().includes(searchQuery)
  );
  renderPosts(filteredPosts);
});
fetchPosts();
