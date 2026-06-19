if (!token) {
    alert("You must signed in!");
    location.href = "/HTML/sign-in-page.html";
}
const params = new URLSearchParams(location.search);
const postId = params.get("id");
if (!postId) {
    throw new Error("No post ID specified in URL");
}

const apiKey = "ffa3384c-a626-40c6-b05b-bd1369671a01"

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
            }
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
    displayApp.setAttribute("role", "region");
    displayApp.setAttribute("aria-live", "polite");
    displayApp.setAttribute("aria-label", "Post content");

    const article = document.createElement("article");
    article.className = "p-4 m-8 rounded-lg bg-[#FFE9CC] shadow-xl";
    article.setAttribute("role", "article");

    const authorDiv = document.createElement("div");
    authorDiv.className = "flex items-center gap-2 mb-4";
    authorDiv.setAttribute("role", "group");
    authorDiv.setAttribute("aria-label", "Post author information");

    const avatarImg = document.createElement("img");
    avatarImg.src =
        post.author?.avatar?.url || "https://i.imghippo.com/files/ZyN1996XVE.png";
    avatarImg.alt = `Profile picture of ${post.author?.name || "the author"}`;
    avatarImg.className = "w-16 h-16 rounded-full cursor-pointer";
    avatarImg.setAttribute("role", "link");
    avatarImg.setAttribute("aria-label", `View profile of ${post.author?.name || "this author"}`);
    avatarImg.tabIndex = 0;

    const authorNavigate = () => {
        location.href = `/HTML/user-page.html?name=${post.author?.name}`;
    };

    avatarImg.addEventListener("click", authorNavigate);
    avatarImg.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            authorNavigate();
        }
    });

    const name = document.createElement("h4");
    name.textContent = post.author?.name;
    name.className = "font-semibold";

    authorDiv.appendChild(avatarImg);
    authorDiv.appendChild(name);

    const title = document.createElement("h5");
    title.id = "post-title";
    title.textContent = post.title || "Untitled";
    title.className = "font-bold text-xl mb-2";

    const body = document.createElement("p");
    body.textContent = post.body;
    body.className = "mb-2";
    body.setAttribute("aria-label", "Post body");

    article.setAttribute("aria-labelledby", "post-title");

    let likes = post._count.reactions || 0;
    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.textContent = `❤️ ${likes}`;
    likeButton.className = "px-2 py-1 rounded-full mb-4";
    likeButton.setAttribute("aria-label", `Like this post, currently ${likes} likes`);

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
                }
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
    commentContainer.setAttribute("role", "region");
    commentContainer.setAttribute("aria-label", "Comments section");

    if (post.comments.length === 0) {
        const noComment = document.createElement("p");
        noComment.textContent = "No comments yet";
        noComment.setAttribute("aria-live", "polite");
        commentContainer.appendChild(noComment);
    } else {
        post.comments.forEach((comment) => {
            const commentParagraph = document.createElement("p");
            commentParagraph.textContent = `${comment.author?.name || comment.owner
                }: ${comment.body}`;
            commentParagraph.className = "border-b py-1";
            commentParagraph.setAttribute("aria-label", `${comment.author?.name || comment.owner} commented: ${comment.body}`);
            commentContainer.appendChild(commentParagraph);
        });
    }
    const inputContainer = document.createElement("div");
    inputContainer.className = "flex flex-row";

    const commentInputField = document.createElement("input");
    commentInputField.type = "text";
    commentInputField.id = "comment-input";
    commentInputField.placeholder = "Add a comment";
    commentInputField.className = "p-2 rounded border-2 rounded-xl bg-gray-100 border-black mt-4 placeholder:text-gray-600 w-[50%] text-center h-12";
    commentInputField.setAttribute("aria-label", "Add a comment");
    commentInputField.setAttribute("aria-describedby", "comment-help");

    const commentHelp = document.createElement("span");
    commentHelp.id = "comment-help";
    commentHelp.style.position = "absolute";
    commentHelp.style.width = "1px";
    commentHelp.style.height = "1px";
    commentHelp.style.padding = "0";
    commentHelp.style.margin = "-1px";
    commentHelp.style.overflow = "hidden";
    commentHelp.style.clip = "rect(0,0,0,0)";
    commentHelp.style.whiteSpace = "nowrap";
    commentHelp.style.border = "0";
    commentHelp.textContent = "Press the comment button to submit your comment.";

    const submitCommentButton = document.createElement("button");
    submitCommentButton.type = "button";
    submitCommentButton.textContent = "COMMENT";
    submitCommentButton.className =
        "p-2 ml-2 mt-4 rounded-lg bg-[#E94E77] font-semibold border-2 h-12 hover:bg-[#e293a8] cursor-pointer";
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
                }
            );
            if (!respons.ok) throw new Error("Failed to post comment");
            commentInputField.value = "";
            fetchPost();
        } catch (error) {
            alert("Error posting comment: " + error.message);
        }
    });
    inputContainer.appendChild(commentInputField);
    inputContainer.appendChild(commentHelp);
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