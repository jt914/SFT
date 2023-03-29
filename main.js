async function fetchInvasivePlants() {
    const response = await fetch('invasive_plants.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const invasivePlants = {};

    lines.slice(1).forEach(line => {
        const [plant, danger] = line.split(',');
        invasivePlants[plant] = danger;
    });

    return invasivePlants;
}

function checkInvasiveSpecies(plantName) {
    return invasivePlants[plantName] || null;
}

function createInvasiveMessage(plantName, invasiveStatus) {
    let invasiveMessage = '';

    if (invasiveStatus) {
        invasiveMessage = `
            <span>${plantName} is an invasive species with</span>
            <span class="badge bg-${invasiveStatus.toLowerCase()}">${invasiveStatus}</span>
            <span>danger level.</span>`;
    } else {
        invasiveMessage = `${plantName} is not an invasive species.`;
    }

    return invasiveMessage;
}

(async () => {
    const invasivePlants = await fetchInvasivePlants();

    const fileInput = document.getElementById('fileInput');
    const submitBtn = document.getElementById('submitBtn');
    const plantName = document.getElementById('plantName');
    const commonNames = document.getElementById('commonNames');
    const wikiUrl = document.getElementById('wikiUrl');
    const wikiDescription = document.getElementById('wikiDescription');
    const preview = document.getElementById('preview');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            imageToBase64(e.target.files[0]);
        }
    });

    submitBtn.addEventListener('click', async () => {
        if (!fileInput.files[0]) {
            alert('Please upload an image');
            return;
        }

        submitBtn.disabled = true;
        loading.style.display = 'block';

        const base64Image = await imageToBase64(fileInput.files[0]);
        const plantData = await identifyPlant(base64Image);

        const invasiveStatus = checkInvasiveSpecies(plantData.plant_name);
        const invasiveMessage = createInvasiveMessage(plantData.plant_name, invasiveStatus);

        const invasiveSpeciesInfo = document.getElementById('invasiveSpeciesInfo');
        invasiveSpeciesInfo.innerHTML = invasiveMessage;

        plantName.textContent = plantData.plant_name;
        commonNames.textContent = `Common names: ${plantData.plant_details.common_names.join(', ')}`;
        wikiUrl.href = plantData.plant_details.url;
        wikiDescription.textContent = plantData.plant_details.wiki_description.value;

        result.style.display = 'block';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    });
})();
