document.addEventListener("DOMContentLoaded", () => {
    // Fetch user data
    fetch("get_user_data.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((userData) => {
        updateUserProfile(userData)
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
      })
  })
  
  function updateUserProfile(userData) {
    // Get the user info container
    const userInfoElement = document.querySelector(".user-info")
  
    if (userInfoElement) {
      // Make the entire user info section clickable
      userInfoElement.style.cursor = "pointer"
      userInfoElement.addEventListener("click", () => {
        window.location.href = "rt_profile.php"
      })
  
      // Add hover effect
      const style = document.createElement("style")
      style.textContent = `
        .user-info {
          transition: opacity 0.2s ease;
        }
        .user-info:hover {
          opacity: 0.8;
        }
      `
      document.head.appendChild(style)
    }
  
    // Update user name
    const userNameElement = document.querySelector(".user-info .user-name")
    if (userNameElement && userData) {
      // Use full_name if available, otherwise use first_name + last_name
      if (userData.full_name) {
        userNameElement.textContent = userData.full_name
      } else if (userData.first_name && userData.last_name) {
        userNameElement.textContent = `${userData.first_name} ${userData.last_name}`
      }
    }
  
    // Update user role/business name
    const userRoleElement = document.querySelector(".user-info .user-role")
    if (userRoleElement && userData && userData.business_name) {
      userRoleElement.textContent = userData.business_name
    }
  
    // Update profile image
    const userAvatarElement = document.querySelector(".user-info .user-avatar")
    if (userAvatarElement && userData && userData.profile_image) {
      // Remove the icon
      userAvatarElement.innerHTML = ""
  
      // Create and add the image element
      const imgElement = document.createElement("img")
      imgElement.src = userData.profile_image
      imgElement.alt = "User Profile"
      imgElement.className = "user-profile-img"
      userAvatarElement.appendChild(imgElement)
  
      // Add some styling for the image
      const style = document.createElement("style")
      style.textContent = `
        .user-avatar .user-profile-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
      `
      document.head.appendChild(style)
    } else {
      // If no profile image, keep the default icon
      console.log("No profile image found, using default icon")
    }
  }
  