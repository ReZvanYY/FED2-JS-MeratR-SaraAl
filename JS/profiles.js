
if(!token){
    window.location.href = "/HTML/sign-in-page.html";
}

const currentUser = JSON.parse(localStorage.getItem("user"));
const apiKeyStorage = "apiKey";
const params = new URLSearchParams(location.search);
const requestedName = params.get("name");

if(!requestedName && !currentUser?.name) {
    throw new Error ("No profile name found");
}

async function getApiKey(){
    let apiKey = localStorage.getItem(apiKeyStorage);
    if(apiKey) return apiKey;

    const response = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
        }
    });

    if(!response.ok) throw new Error("Failed to generate key");
    const responsData = await response.json();

    apiKey = responsData.data.key;
    localStorage.setItem(apiKeyStorage, apiKey);
    return apiKey;
}

async function fetchProfile(){
    try{
        const apiKey = await getApiKey();

        let profileToFetch = requestedName || currentUser.name;
        if(requestedName && requestedName === currentUser.name) {
            profileToFetch = currentUser.name
        }

        const response = await fetch(`https://v2.api.noroff.dev/social/profiles/${profileToFetch}?_followers=true&_following=true&_posts=true`, {
            method: "GET",
            headers: {
                 Authorization: `Bearer ${token}`, 
                 "X-Noroff-API-Key": apiKey,
            }
        });
        if(!response.ok) throw new Error("Failed to fetch profile");
        const result = await response.json();

        document.title = "Rizz Zone: " + result.data.name;

        if(result.data.name === currentUser.name){
            renderProfile(result.data, true);
        } else {
            renderProfile(result.data, false);
        }
        renderUserPosts(result.data.posts || []);
    } catch(error){
        alert("Unable to render profile: " + error.message);
        console.error(error);
    }
}

function renderProfile(profile, isCurrentUser){
    const displayApp = document.getElementById("display-app");
    displayApp.innerHTML = "";

    const banner = document.createElement("div");
    banner.className = "h-48 w-full bg-cover bg-center";
    banner.style.backgroundImage = `url(${profile.banner?.url || 'https://i.imghippo.com/files/ZyN1996XVE.png'
    })`;
    displayApp.appendChild(banner);

    const profileInfo = document.createElement("div");
    profileInfo.className = "flex flex-col items-center gap-4 mt-4";

    const userAvatar = document.createElement("img");
    userAvatar.src = profile.avatar?.url || 'https://i.imghippo.com/files/ZyN1996XVE.png';
    userAvatar.alt = profile.avatar?.alt || 'Users profile picture.';
    userAvatar.className = "w-64 rounded-full";

    const textContainer = document.createElement("div");

    const nameElement = document.createElement("h2");
    nameElement.className = "text-4xl font-bold";
    nameElement.textContent = profile.name;

    const followerCount = document.createElement("p");
    followerCount.textContent =`Followers: ${profile._count.followers} Following: ${profile._count.following}`;

    textContainer.appendChild(nameElement);
    textContainer.appendChild(followerCount);

    profileInfo.appendChild(userAvatar);
    profileInfo.appendChild(textContainer);

    displayApp.appendChild(profileInfo);

    if(isCurrentUser){
        const avatarInput = document.createElement("input");
        avatarInput.type = "url";
        avatarInput.placeholder = "Use a public URL"
        avatarInput.className = "ml-2 rounded border-2 rounded-xl bg-gray-100 border-black mt-4 placeholder:text-gray-600 text-center h-12";

        const updateButton = document.createElement("button");
        updateButton.textContent = "Update Profile Picture";
        updateButton.className = "m-2 rounded-lg bg-[#E94E77] font-semibold border-2 h-12 hover:bg-[#e293a8] cursor-pointer"

        updateButton.addEventListener("click", async () =>{
            const avatarUrl = avatarInput.value.trim();
            if(!avatarUrl) {
                alert("Please enter a valid public image url");
                return;
            }
            try{
                const apiKey = await getApiKey();
                const response = await fetch(`https://v2.api.noroff.dev/social/profiles/${profile.name}`, {
                
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-Noroff-API-Key": apiKey,
                },
                body : JSON.stringify({    
                        avatar: {
                        url: avatarUrl,
                        alt: "Profile picture" 
                    }
                })
            });
                if(!response.ok) throw new Error("Failed to update profile picture");

                const result = await response.json();
                userAvatar.src = result.data.avatar?.url;
                alert("Profile Picture is now updated!");
            } catch (error) {
                console.error("Error updating profile picture ", error.message);
                alert(error.message)
            }
        });
        displayApp.appendChild(avatarInput);
        displayApp.appendChild(updateButton);
    }

    if(!isCurrentUser) {
        const followButton = document.createElement("button");

        let isFollowing = profile.followers?.some(
            (f) => f.name === currentUser.name);

    followButton.textContent = isFollowing ? "UNFOLLOW" : "FOLLOW";
    followButton.className = "px-4 mt-2 bg-green-300 hover:bg-green-500";

    followButton.addEventListener("click", async () => {
        try {
            const apiKey = await getApiKey();
            const apiUrl = `https://v2.api.noroff.dev/social/profiles/${profile.name}/${isFollowing ? "unfollow" : "follow"}`;
            
            const respons = await fetch(apiUrl, {
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey, 
            },
        });

        if(!respons.ok) throw new Error("Failed to update follow status");
        
        isFollowing = !isFollowing;
        followButton.textContent = isFollowing ? "UNFOLLOW" : "FOLLOW";
        
        fetchProfile();
    } catch (error){
        console.error("Error in the follow/unfollow interaction", error.message);
        alert("Error " + error.message);
    }
});
    displayApp.appendChild(followButton);
}
}

function renderUserPosts(posts) {
    const displayApp = document.getElementById("display-app");

    const postsContainer = document.createElement("div");
    postsContainer.className = "p-4 m-2 rounded-lg bg-[#FFE9CC] shadow-xl"

    const title = document.createElement("h3");
    title.textContent = "Your Posts";
    title.className = "text-xl font-bold mb-2 mt-2";
    postsContainer.appendChild(title);

    if(!posts.length){
        const noPost = document.createElement("p");
        noPost.textContent = "No posts found!";
        postsContainer.appendChild(noPost);
    } else {
        posts.forEach(post => {
            const postLink = document.createElement("a");
            postLink.href = `/HTML/post-specific-page.html?id=${post.id}`;
            postLink.className = "block cursor-pointer";

            const postArticle = document.createElement("article");
            postArticle.className = "bg-white hover:border-b-3 hover:shadow-xl rounded p-4 mb-4";

            const postTitle = document.createElement("h4");
            postTitle.textContent = post.title || "No title";
            postTitle.className = "font-semibold text-lg mb-2 mt-2";

            const postBodyText = document.createElement("p");
            postBodyText.textContent = post.body;

            postArticle.appendChild(postTitle);
            postArticle.appendChild(postBodyText);
            postLink.appendChild(postArticle);

            postsContainer.appendChild(postLink);
        });
    }

    displayApp.appendChild(postsContainer);
}

fetchProfile();
