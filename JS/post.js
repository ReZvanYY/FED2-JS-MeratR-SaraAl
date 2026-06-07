if (!token) {
  alert("You must signed in!");
  location.href = "/HTML/sign-in-page.html";
}
const params = new URLSearchParams(location.search);
const postId = params.get("id");
if (!postId) {
  throw new Error("No post ID specified in URL");
}

const apiKey = "ffa3384c-a626-40c6-b05b-bd1369671a01";

async function fetchPost() {
  try {
    const respons = await fetch(
      `https://v2.api.noroff.dev/social/posts/${postId}?_author=true&_comments=true&_reactions=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      },
    );
    if (!respons.ok) throw new Error("Failed to fetch post");

    const result = await respons.json();
    renderPost(result.data);
  } catch (error) {
    console.error("Error fetching post: " + error.message);
    alert(error.message);
  }
}

function renderPost(post) {
  const displayApp = document.getElementById("display-app");
  displayApp.textContent = "";

  const article = document.createElement("article");
  article.className = "p-4 mb-6 mt-6 mr-4 ml-4 rounded-lg bg-red-50 shadow-2xl";
  article.setAttribute("role", "article");

  const authorDiv = document.createElement("div");
  authorDiv.className = "flex items-center gap-2 mb-4";

  const avatarImg = document.createElement("img");
  avatarImg.src =
    post.author?.avatar?.url || "https://i.imghippo.com/files/ZyN1996XVE.png";
  avatarImg.alt = post.author?.name;
  avatarImg.className = "w-10 h-10 rounded-full cursor-pointer";
  avatarImg.setAttribute("role", "button");
  avatarImg.setAttribute(
    "aria-label",
    `View profile for ${post.author?.name || "post author"}`,
  );

  avatarImg.addEventListener("click", () => {
    location.href = `/HTML/user-page.html?name=${post.author?.name}`;
  });

  const name = document.createElement("h4");
  name.textContent = post.author?.name;
  name.className = "font-semibold";

  authorDiv.appendChild(avatarImg);
  authorDiv.appendChild(name);

  const title = document.createElement("h5");
  title.textContent = post.title || "Untitled";
  title.className = "font-bold text-xl mb-2";

  const body = document.createElement("p");
  body.textContent = post.body;
  body.className = "mb-2";

  let likes = post._count.reactions || 0;
  const likeButton = document.createElement("button");
  likeButton.textContent = `❤️ ${likes}`;
  likeButton.className = "px-2 py-1 border rounded-full mb-4";
  likeButton.setAttribute(
    "aria-label",
    `Like post titled ${post.title || "Untitled"}`,
  );
  likeButton.setAttribute("aria-pressed", "false");

  likeButton.addEventListener("click", async () => {
    try {
      const respons = await fetch(
        `https://v2.api.noroff.dev/social/posts/${post.id}/react/❤️`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
        },
      );
      if (!respons.ok) throw new Error("Failed to like post");

      const result = await respons.json();
      likes =
        result.data.reactions.find((r) => r.symbol === "❤️")?.count || likes;
      likeButton.textContent = `❤️ ${likes}`;
    } catch (error) {
      console.error("Error liking the post" + error.message);
      alert("Error liking the post " + error.message);
    }
  });

  const commentContainer = document.createElement("div");
  commentContainer.className = "mt-4";
  commentContainer.setAttribute("role", "list");

  if (post.comments.length === 0) {
    const noComment = document.createElement("p");
    noComment.textContent = "No comments yet";
    noComment.setAttribute("role", "listitem");
    commentContainer.appendChild(noComment);
  } else {
    post.comments.forEach((comment) => {
      const commentParagraph = document.createElement("p");
      commentParagraph.textContent = `${
        comment.author?.name || comment.owner
      }: ${comment.body}`;
      commentParagraph.className = "border-b py-1";
      commentParagraph.setAttribute("role", "listitem");
      commentContainer.appendChild(commentParagraph);
    });
  }
  const inputContainer = document.createElement("div");
  inputContainer.className = "flex gap-2 mt-2";

  const commentInputField = document.createElement("input");
  commentInputField.type = "text";
  commentInputField.placeholder = "Add a comment";
  commentInputField.className =
    "px-2 py-3 ml-2 rounded border-2 border-black w-[50%] text-center mt-2";
  commentInputField.setAttribute("aria-label", "Add a comment");

  const submitCommentButton = document.createElement("button");
  submitCommentButton.textContent = "COMMENT";
  submitCommentButton.className =
    "px-2 py-3 ml-2 rounded bg-[#1DA1F2] text-white border-2 border-black mt-2 cursor-pointer";
  submitCommentButton.setAttribute("aria-label", "Submit comment");

  submitCommentButton.addEventListener("click", async () => {
    const commentText = commentInputField.value.trim();
    if (!commentText) return;

    try {
      const respons = await fetch(
        `https://v2.api.noroff.dev/social/posts/${post.id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({ body: commentText }),
        },
      );
      if (!respons.ok) throw new Error("Failed to post comment");
      commentInputField.value = "";
      fetchPost();
    } catch (error) {
      alert("Error posting comment: " + error.message);
    }
  });
  inputContainer.appendChild(commentInputField);
  inputContainer.appendChild(submitCommentButton);

  article.appendChild(authorDiv);
  article.appendChild(title);
  article.appendChild(body);
  article.appendChild(likeButton);
  article.appendChild(commentContainer);
  article.appendChild(inputContainer);

  displayApp.appendChild(article);
}
fetchPost();
