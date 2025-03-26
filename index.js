document.addEventListener("DOMContentLoaded", () => {
  const baseURL = "http://localhost:6006/recipes";
  const recipeContainer = document.getElementById("recipes-container");
  const form = document.getElementById("recipe-form");

  // Fetch and render all recipes
  fetch(baseURL)
    .then((res) => res.json())
    .then((recipes) => {
      recipes.forEach(renderRecipe);
    })
    .catch((err) => console.error("Failed to fetch recipes", err));

  // Render a single recipe card
  function renderRecipe(recipe) {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" class="recipe-img"/>
      <h3>${recipe.name}</h3>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
      <button class="view-btn">View Details</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    // View details
    card.querySelector(".view-btn").addEventListener("click", () => {
      alert(
        `🍽 ${recipe.name}\n\nIngredients:\n- ${recipe.ingredients.join(
          "\n- "
        )}\n\nSteps:\n- ${recipe.steps.join("\n- ")}`
      );
    });

    // Delete recipe
    card.querySelector(".delete-btn").addEventListener("click", () => {
      fetch(`${baseURL}/${recipe.id}`, {
        method: "DELETE",
      })
        .then(() => {
          card.remove();
        })
        .catch((err) => console.error("Failed to delete", err));
    });

    // Edit recipe (patch name only)
    card.querySelector(".edit-btn").addEventListener("click", () => {
      const newName = prompt("Edit recipe name:", recipe.name);
      if (newName && newName.trim() !== "") {
        fetch(`${baseURL}/${recipe.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName.trim() }),
        })
          .then((res) => res.json())
          .then((updatedRecipe) => {
            card.querySelector("h3").textContent = updatedRecipe.name;
          })
          .catch((err) => console.error("Failed to update", err));
      }
    });

    recipeContainer.appendChild(card);
  }

  // Add new recipe (POST)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newRecipe = {
      name: form.name.value.trim(),
      image: form.image.value.trim(),
      ingredients: form.ingredients.value
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      steps: form.steps.value
        .split(".")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    // Basic validation
    if (
      !newRecipe.name ||
      !newRecipe.image ||
      newRecipe.ingredients.length === 0 ||
      newRecipe.steps.length === 0
    ) {
      alert("Please fill out all fields correctly.");
      return;
    }

    fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecipe),
    })
      .then((res) => res.json())
      .then((createdRecipe) => {
        renderRecipe(createdRecipe);
        form.reset();
      })
      .catch((err) => console.error("Failed to add recipe", err));
  });
});
