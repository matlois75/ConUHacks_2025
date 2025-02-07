# Concordia Virtual Tour++ | ConUHacks IX

## Contributors
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/matlois75.png" width="100" height="100" style="border-radius: 50%;">
      <br>
      <a href="https://github.com/matlois75">@matlois75</a>
    </td>
    <td align="center">
      <img src="https://github.com/benyoon1.png" width="100" height="100" style="border-radius: 50%;">
      <br>
      <a href="https://github.com/benyoon1">@benyoon1</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/denis-oh.png" width="100" height="100" style="border-radius: 50%;">
      <br>
      <a href="https://github.com/denis-oh">@denis-oh</a>
    </td>
    <td align="center">
      <img src="https://github.com/rickyc0.png" width="100" height="100" style="border-radius: 50%;">
      <br>
      <a href="https://github.com/rickyc0">@rickyc0</a>
    </td>
  </tr>
</table>

## Overview
Currently, Concordia's [virtual tour webpage](https://www.concordia.ca/admissions/visit/virtual-tours/sgw-academic-buildings-learning-spaces.html) is limited, featuring only a single, fixed 360-degree image. We present **Concordia Virtual Tour++**, a fully interactive web app that lets users explore and navigate freely across the campus, using 3D Gaussian Splatting. It also features a chatbot answering any questions related to Concordia or the scene you are currently in. You can find it at [concordia.design](https://concordia.design/).

## Before vs. After
Concordia's current virtual tour is static, while **Virtual Tour++** allows for free movement.

### Before
![Before](public/assets/current_virtual_tour.gif)

### After
![After](public/assets/our_virtual_tour.gif)

**Live Demo:** [YouTube Video](https://youtu.be/A_DX9EN-Qm8?si=9cySosMlBfppZ0zA)

## Installation

### **Prerequisites**
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- npm (`npm` comes with Node.js)

### **Clone the Repository**
```sh
git clone https://github.com/matlois75/ConUHacks_2025.git
cd ConUHacks_2025
npm install
```

### **Running the Web App**
Run `node index.js`

## Workflow

### 3D Gaussian Splatting:
Image capture -> COLMAP -> Train -> Get 3D model -> Plug into WebGL Viewer -> Implement controls -> Implement collision detection

### AI Chatbot:
1) If another model is desired: Replace the HuggingFace model link with your new link (simply provide the link if using a model under 10MB in size)
2) Generate your HuggingFace API key
3) For local development: Create a .env file which should include:<br/>
  &emsp;HUGGINGFACE_API_KEY=[your_key]<br/>
  &emsp;PORT=3000<br/>
For public deployment:<br/>
  &emsp;Create HUGGINGFACE_API_KEY and PORT environment variables (PORT number may depend on deployment method)

## Acknowledgements

This project was made possible thanks to the following contributions:

- **[Antimatter15's WebGL 3D Gaussian Splat Viewer](https://github.com/antimatter15/splat)**  
  A WebGL viewer for rendering Gaussian Splatting, which serves as the core technology behind our interactive campus experience.

- **[3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)**  
  The foundational research paper that enabled the development of high-quality, real-time rendering using Gaussian Splatting.

- **ConUHacks IX Hackathon**  
  This project was developed in under 24 hours as part of ConUHacks IX, where we explored innovative ways to enhance Concordia’s virtual tour experience.
