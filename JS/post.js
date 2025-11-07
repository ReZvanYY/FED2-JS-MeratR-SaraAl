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

    const article = document.createElement("article");
    article.className = "p-4 m-8 rounded-lg bg-[#FFE9CC] shadow-xl";

    const authorDiv = document.createElement("div");
    authorDiv.className = "flex items-center gap-2 mb-4";

    const avatarImg = document.createElement("img");
    avatarImg.src =
        post.author?.avatar?.url || "https://i.imghippo.com/files/ZyN1996XVE.png";
    avatarImg.alt = post.author?.name;
    avatarImg.className = "w-16 h-16 rounded-full cursor-pointer";

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
    likeButton.className = "px-2 py-1 rounded-full mb-4";

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

    if (post.comments.length === 0) {
        const noComment = document.createElement("p");
        noComment.textContent = "No comments yet";
        commentContainer.appendChild(noComment);
    } else {
        post.comments.forEach((comment) => {
            const commentParagraph = document.createElement("p");
            commentParagraph.textContent = `${comment.author?.name || comment.owner
                }: ${comment.body}`;
            commentParagraph.className = "border-b py-1";
            commentContainer.appendChild(commentParagraph);
        });
    }
    const inputContainer = document.createElement("div");
    inputContainer.className = "flex flex-row";

    const commentInputField = document.createElement("input");
    commentInputField.type = "text";
    commentInputField.placeholder = "Add a comment";
    commentInputField.className = "p-2 rounded border-2 rounded-xl bg-gray-100 border-black mt-4 placeholder:text-gray-600 w-[50%] text-center h-12";

    const submitCommentButton = document.createElement("button");
    submitCommentButton.textContent = "COMMENT";
    submitCommentButton.className =
        "p-2 ml-2 mt-4 rounded-lg bg-[#E94E77] font-semibold border-2 h-12 hover:bg-[#e293a8] cursor-pointer";

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