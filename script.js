// Client-side demo classifier (no uploads, no storage)
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const analyzeBtn = document.getElementById('analyzeBtn');
const reanalyzeBtn = document.getElementById('reanalyzeBtn');
const sampleBtn = document.getElementById('sampleBtn');
const result = document.getElementById('result');
const predLabel = document.getElementById('predLabel');
const predDesc = document.getElementById('predDesc');
const doctorRec = document.getElementById('doctorRec');

const LABELS = [
  { id: 'No issue detected', desc: 'No obvious skin condition detected in this demo.', doctor: 'General Physician' },
  { id: 'Acne or Inflammation', desc: 'Red bumps or pimples with local inflammation (demo label).', doctor: 'Dermatologist' },
  { id: 'Eczema-like', desc: 'Dry, scaly or red patches (demo label).', doctor: 'Dermatologist' },
  { id: 'Fungal-like', desc: 'Spot with ring-like or scaly appearance (demo label).', doctor: 'Dermatologist' },
  { id: 'Suspected Infection', desc: 'Area looks inflamed and possibly infected (demo label).', doctor: 'Infectious Disease Specialist' }
];

function computeRednessScore(img) {
  const w = 128, h = 128;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let rSum = 0, gSum = 0, bSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i];
    gSum += data[i+1];
    bSum += data[i+2];
  }
  const px = data.length / 4;
  const rAvg = rSum / px;
  const gAvg = gSum / px;
  const bAvg = bSum / px;
  const redness = rAvg / (rAvg + gAvg + bAvg + 1e-9);
  return { redness, rAvg, gAvg, bAvg };
}

function demoClassify(img) {
  const { redness, rAvg, gAvg, bAvg } = computeRednessScore(img);
  const brightness = (rAvg + gAvg + bAvg) / 3 / 255;
  if (brightness < 0.12) return 0;
  if (redness > 0.45 && brightness > 0.25) return 1;
  if (redness > 0.38 && brightness <= 0.25) return 4;
  if (brightness > 0.75 && redness < 0.38) return 2;
  if (redness < 0.35 && brightness >= 0.2) return 3;
  return 0;
}

function showResult(labelObj) {
  predLabel.textContent = labelObj.id;
  predDesc.textContent = labelObj.desc;
  doctorRec.textContent = labelObj.doctor;
  result.hidden = false;
}

analyzeBtn.addEventListener('click', () => {
  if (!preview.src) {
    alert('Please choose or load an image first.');
    return;
  }
  const img = new Image();
  img.onload = () => {
    const idx = demoClassify(img);
    const labelObj = LABELS[idx] || LABELS[0];
    showResult(labelObj);
  };
  img.src = preview.src;
});

reanalyzeBtn.addEventListener('click', () => {
  fileInput.value = '';
  preview.src = '';
  preview.style.display = 'none';
  result.hidden = true;
});

fileInput.addEventListener('change', (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  preview.src = URL.createObjectURL(f);
  preview.onload = () => { URL.revokeObjectURL(preview.src); preview.style.display = 'block'; };
  result.hidden = true;
});

sampleBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4d6c6';
  ctx.fillRect(0,0,200,200);
  preview.src = canvas.toDataURL('image/png');
  preview.style.display = 'block';
  result.hidden = true;
});
