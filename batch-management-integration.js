<!-- Add these containers to your inventory.html file -->
<div id="edit-batch-modal-container"></div>
<div id="delete-batch-modal-container"></div>

<!-- Add these script and style tags to your inventory.html file -->
<link rel="stylesheet" href="batch-modal-enhanced.css">
<script src="batch-management-enhanced.js"></script>

<!-- Add this script to initialize the batch management functionality -->
<script>
  document.addEventListener("DOMContentLoaded", function() {
    // Check if the batch management functionality is already initialized
    if (typeof window.openEditBatchModal !== "function") {
      console.log("Initializing batch management functionality");
      
      // Create modal containers if they don't exist
      if (!document.getElementById("edit-batch-modal-container")) {
        const editModalContainer = document.createElement("div");
        editModalContainer.id = "edit-batch-modal-container";
        document.body.appendChild(editModalContainer);
      }

      if (!document.getElementById("delete-batch-modal-container")) {
        const deleteModalContainer = document.createElement("div");
        deleteModalContainer.id = "delete-batch-modal-container";
        document.body.appendChild(deleteModalContainer);
      }
    }
  });
</script>

