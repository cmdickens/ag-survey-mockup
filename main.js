const D = document;

function initMap() {
  const myLatLon = { lat: 31.5, lon: -99.0 };
  // bounding box around the US
  const usExtent = ol.extent.boundingExtent([[-14400000, 2700000], [-14400000, 6580000], [-7200000, 6580000], [-7200000, 2700000]]);


  // create current location pin
  const locIconFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([myLatLon.lon, myLatLon.lat])),
  });
  const locIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      scale: 1,
      crossOrgin: "",
      src: "./assets/location-dot-solid-1.svg",
    }),
  });

  locIconFeature.setStyle(locIconStyle);

  const vectorSource = new ol.source.Vector({
    features: [locIconFeature],
  });

  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });


  const map  = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      vectorLayer
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([myLatLon.lon, myLatLon.lat]),
      zoom: 5,
      extent: usExtent,
      enableRotation: false,
    }),
    controls: [
      new ol.control.Zoom(),
      new ol.control.Attribution()
    ]
  });



  map.on("click", (e) => {
    const coords = map.getEventCoordinate(e.originalEvent);
    locIconFeature.setGeometry(new ol.geom.Point(coords));

    const latLon = ol.proj.toLonLat(coords)
    D.querySelector("#coords > span").innerHTML = `${latLon[1].toFixed(6)} ${latLon[0].toFixed(6)}`;
    stepFunctions.step1.coordsUpdate();
  });
}

function submitForm() {
  console.log("test")
  alert("Eventually this information will be sent to a server at which point that will be processed and data will be returned.");

  D.querySelector("#steps").classList.add("hide");
  D.querySelector("#thankyou").classList.remove("hide");
}

function closeAllSteps(stepNum) {
  if(stepNum === undefined) stepNum = -1;
  const stepsEles = D.querySelectorAll("details.step");

  for(let i = 0; i < stepsEles.length; i++) {
    const ele = stepsEles[i];
    if(i == stepNum-1) {
      ele.setAttribute("open", true);

      // scroll the page to make sure the can see the top of the step
      ele.scrollIntoView(true);
    } else {
      ele.removeAttribute("open");
    }
  }

}
function nextStep(currStepNum) {
  const stepsEles = D.querySelectorAll("details.step");

  if(stepFunctions[`step${currStepNum}`].continue) {
    const ele = stepsEles[currStepNum];
    ele.querySelector("summary").removeAttribute("disabled");
    closeAllSteps(currStepNum+1);
  }
}

// used for the custom form element button-select
function updateButtSelectValue(ele) {
  const butts = ele.querySelectorAll("button");

  for(let butt of butts) {
    if(butt.classList.contains("active")) {
      ele.selectedValue = butt.innerText;
      break;
    }
  }
}

function updateContinueState(stepNum, disabled) {
  const butt = D.querySelector(`#step${stepNum} > .step-navigation > button`);

  // update continue variable
  stepFunctions[`step${stepNum}`].continue = !disabled;

  // update button disabled look
  if(disabled) {
    butt.classList.add("disabled");
  } else {
    butt.classList.remove("disabled");
  }
}

const stepFunctions = {
  "step1": {
    continue: false,
    coordsUpdate: function() {
      const coords = D.querySelector("#coords > span").innerText;
      console.log(coords)
      if(coords.split(" ").length === 2) {
        updateContinueState(1, false);
      }

    },
    init: function() {
    },
  },
  "step2": {
    continue: true,
    init: function() {
      // add custom event listener function
      D.querySelector("#step2 > .content > .button-select").removeEventListener("update", function() {});
      D.querySelector("#step2 > .content > .button-select").addEventListener("update", function() {
        stepFunctions["step2"].updateForm(this);
      });
    },
    updateForm: function(ele) {
      if(ele.selectedValue === "Yes") {
        ele.parentElement.children[1].classList.add("hide");
      } else if(ele.selectedValue === "No") {
        ele.parentElement.children[1].classList.remove("hide");
      }
    }
  },
  "step3": {
    continue: true,
    init: function() {
      const today = new Date();
      const lastPlantDate = D.querySelector("#last-plant-date");
      const lastHarvestDate = D.querySelector("#last-harvest-date");
      const minDate = new Date();
      minDate.setYear(today.getFullYear() - 2);

      lastPlantDate.max = today.toISOString().split("T")[0];
      lastPlantDate.min = minDate.toISOString().split("T")[0];
      lastHarvestDate.max = today.toISOString().split("T")[0];
      lastHarvestDate.min = minDate.toISOString().split("T")[0];

      // add event input update event listner to the irrigation style input
      D.querySelector("#step3 > .content > .row > .col:nth-of-type(2) > select").addEventListener("input", function() {stepFunctions.step3.irrigationStyle(this)});
    },
    irrigationStyle: function(ele) {
      if(ele.value === "Other") {
        D.querySelector("#other-irrigation-system").classList.remove("hide");
      } else {
        D.querySelector("#other-irrigation-system").classList.add("hide");
      }
    }
  },
  "step4": {
    continue: true,
    init: function() {
      const dropdowns = D.querySelectorAll("#step4 > .content > .col > ol > li");
      for(const drop of dropdowns) {
        let options = "";
        for(const pest of lists.pests) {
          options += `<option value="${pest}">${pest}</option>`;
        }
        drop.querySelector("select").innerHTML += options;
      }
    }
  },
  "step5": {
    continue: true,
    init: function() {
      const dropdowns = D.querySelectorAll("#step5 > .content > .col > ol > li");
      for(const drop of dropdowns) {
        let options = "";
        for(const disease of lists.diseases) {
          options += `<option value="${disease}">${disease}</option>`;
        }
        drop.querySelector("select").innerHTML += options;
      }
    }
  },
  "step6": {
    continue: true,
    init: function() {
      // add custom event listener function
      D.querySelector("#step6 > .content > .button-select").removeEventListener("update", function() {});
      D.querySelector("#step6 > .content > .button-select").addEventListener("update", function() {
        stepFunctions["step6"].updateForm(this);
      });

      // add weeds checkboxes
      const weedsEle = D.querySelector("#step6 > .content > .input-group:nth-child(2)");
      let weedsHTML = "";
      for(const weed of lists.weeds) {
        weedsHTML += `<label><input type="checkbox" />${weed}</label>`;
      }
      weedsEle.innerHTML += weedsHTML;
    },
    updateForm: function(ele) {
      const weedsEle = ele.parentElement.children[1];

      if(ele.selectedValue === "Yes") {
        weedsEle.classList.remove("hide");
      } else if(ele.selectedValue === "No") {
        weedsEle.classList.add("hide");
      }
    }
  },
  "step7": {
    continue: true,
    init: function() {
      // updates the function to run when the value of the button-select is changed
      D.querySelector("#step7 > .content > :nth-child(2) > .button-select").removeEventListener("update", function() {});
      D.querySelector("#step7 > .content > :nth-child(2) > .button-select").addEventListener("update", function() {
        stepFunctions["step7"].updateForm(this);
      });
    },
    updateForm: function(ele) {
      const textarea = ele.parentElement.children[3];

      if(ele.selectedValue === "Yes") {
        textarea.classList.add("hide");
      } else if(ele.selectedValue === "No") {
        textarea.classList.remove("hide");
      }
    }
  },
  "step8": {
    continue: true,
    init: function() {
      // add pests checkboxes
      const pestsEle = D.querySelector("#step8 > .content > .row:nth-child(2) > .col:nth-child(1) > .input-group");
      let pestsHTML = "";
      for(const pest of lists.pests) {
        pestsHTML += `<label><input type="checkbox"/>${pest}</label>`;
      }
      pestsEle.innerHTML += pestsHTML;

      // add onchange event to all checkboxes
      for(const checkbox of [...pestsEle.children].slice(1)) {
        checkbox.onchange = function() {
          if(this.innerText === "Cotton fleahoppers")
            stepFunctions["step9"].updateFleahopperQuestions(this.querySelector("input").checked);
        }
      }


      // add diseases elements
      const diseasesEle = D.querySelector("#step8 > .content > .row:nth-child(2) > .col:nth-child(2) > .input-group");
      let diseasesHTML = "";
      for(const disease of lists.diseases) {
        diseasesHTML += `<label><input type="checkbox"/>${disease}</label>`;
      }
      diseasesEle.innerHTML += diseasesHTML;
    },
  },
  "step9": {
    continue: true,
    init: function() {
      // updates the function to run when the value of the button-select is changed
      D.querySelector("#step9 > .content > .col:nth-child(2) > .button-select:nth-child(2)").removeEventListener("update", function() {});
      D.querySelector("#step9 > .content > .col:nth-child(2) > .button-select:nth-child(2)").addEventListener("update", function() {
        stepFunctions["step9"].showFleahoppers(this);
      });

      D.querySelector("#step9 > .content > .col:nth-child(4) > .col:nth-child(5) > .button-select:nth-child(2)").removeEventListener("update", function() {});
      D.querySelector("#step9 > .content > .col:nth-child(4) > .col:nth-child(5) > .button-select:nth-child(2)").addEventListener("update", function() {
        stepFunctions["step9"].showSprayerType(this);
      });

    },
    showFleahoppers: function(ele) {
      const fleahoppers = D.querySelector("#step9 > .content > #fleahoppers");

      if(ele.selectedValue === "Yes") {
        fleahoppers.classList.remove("hide");
      } else if(ele.selectedValue === "No") {
        fleahoppers.classList.add("hide");
      }
    },
    showSprayerType: function(ele) {
      const sprayerTypeContainer = D.querySelector("#step9 > .content > .col:nth-child(4) > .col:nth-child(5) > .col:nth-child(3)");

      if(ele.selectedValue === "Yes") {
        sprayerTypeContainer.classList.add("hide");
      } else if(ele.selectedValue === "No") {
        sprayerTypeContainer.classList.remove("hide");
      }
    },
    updateFleahopperQuestions: function(show) {
      if(show) {
        D.querySelector("#step9 > .content > .col:nth-child(4)").classList.remove("hide");
      } else {
        D.querySelector("#step9 > .content > .col:nth-child(4)").classList.add("hide");
      }
    },
  },
  "step10": {
    continue: true,
    init: function() {}
  },
  "step11": {
    continue: true,
    init: function() {
      // updates the function to run when the value of the button-select is changed
      D.querySelector("#step11 > .content > .col:nth-child(1) > .button-select:nth-child(2)").removeEventListener("update", function() {});
      D.querySelector("#step11 > .content > .col:nth-child(1) > .button-select:nth-child(2)").addEventListener("update", function() {
        stepFunctions["step11"].updateForm(this);
      });
    },
    updateForm: function(ele) {
      const textarea = D.querySelector("#step11 > .content > .col:nth-child(1) > .col:nth-child(3)");
      if(ele.selectedValue === "Yes") {
        textarea.classList.remove("hide");
      } else {
        textarea.classList.add("hide");
      }
    }
  },
};

const lists = {
  pests: ["Cotton fleahoppers", "Helicoverpa", "Spider mites", "Mirids", "Aphids", "Whiteflies", "Thrips", "Armyworms", "Cotton bollworms"],
  diseases: ["test1", "test2", "test3"],
  weeds: ["Poison Sumac", "Kapanese Knot Weed", "Crabgrass", "Dandelions", "Canada Thistle", "Ground Ivy", "Purslane", "Stinging", "Clover Leaf", "Quakgrass", "Common Ragweed"],
}

function init() {
  initMap();

  // add click event handler to all the "continue" buttons for all the steps
  const stepsEles = D.querySelectorAll("details.step");

  for(let i = 0; i < stepsEles.length; i++) {
    const ele = stepsEles[i];
    const summary = ele.querySelector("summary");
    const butt = ele.querySelector(".step-navigation>button");


    summary.onclick = function() {
      closeAllSteps();
    }

    // dont do the last step since that will be a submit button
    if(i < stepsEles.length - 1) {
      // set continue button disabled state
      updateContinueState(i+1, !stepFunctions[`step${i+1}`].continue);


      butt.onclick = function() {
        // we are passing the step number (which starts at 1 not 0)
        if(stepFunctions[`step${i+1}`].continue)
          nextStep(i+1);
      }
    }
  }


  // add click event handler for ALL custom form element button-select
  const buttSelectors = D.querySelectorAll(".button-select");
  for(let i = 0; i < buttSelectors.length; i++) {
    // add the update event listner to the button-select form element
    buttSelectors[i].addEventListener("update", function() {
      updateButtSelectValue(this);
    });
    // update the value at the start
    buttSelectors[i].dispatchEvent(new Event("update"));

    const buttSelectorButtons = buttSelectors[i].querySelectorAll("button");

    for(let butt of buttSelectorButtons) {
      butt.onclick = function() {
        for(let i = 0; i < buttSelectorButtons.length; i++) {
          const e = buttSelectorButtons[i];
          e.classList.remove("active");
        }
        butt.classList.add("active");

        // tell the button-selector element to update its values
        buttSelectors[i].dispatchEvent(new Event("update"));
      }
    }

  }

  for(const funcs of Object.values(stepFunctions)) {
    if(funcs.init) {
      funcs.init();
    }
  }


  // add svg chivron icon to all .chivron elements
  const chivs = D.querySelectorAll(".chivron");
  for(const chiv of Array.from(chivs)) {
    chiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/></svg>`;
  }
}
