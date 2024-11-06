<template>
    <div class="container">
        <h2 class="text-center mb-4">ZEN GARDEN [GARDEN]</h2>

        <!-- Sensor Data Section with Dropdown -->
        <div class="row">
            <!-- Dropdown on the Left -->
            <div class="col-lg-3 section-container">
                <h3 class="section-title">Select Sensor</h3>

                <!-- Sensor Dropdown -->
                <div class="dropdown-section">
                    <select v-model="selectedSensorIndex" class="form-select" @change="updateSelectedSensor">
                        <option v-for="(sensor, index) in sensorData" :key="sensor.devEUI" :value="index">
                            Planter Pot {{ index + 1 }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Sensor Data Display on the Right -->
            <div class="col-lg-6 section-container">
                <h3 class="section-title">Planter Pot Data</h3>

                <!-- Display Sensor Data -->
                <div class="sensor-box">
                    <p><b>Temperature:</b> {{ currentSensor.Temperature }} °C</p>
                    <p><b>Soil Moisture:</b> {{ currentSensor.SoilMoisture }} %</p>
                    <p><b>pH Level:</b> {{ currentSensor.pH }}</p>
                    <p><b>Electrical Conductivity (EC):</b> {{ currentSensor.EC }} µS/cm</p>
                    <p><b>Nitrogen:</b> {{ currentSensor.N }} ppm</p>
                    <p><b>Phosphorus:</b> {{ currentSensor.P }} ppm</p>
                    <p><b>Potassium:</b> {{ currentSensor.K }} ppm</p>
                    <p><b>Battery Voltage:</b> {{ currentSensor.BatteryVoltage }} V</p>
                </div>
            </div>
        </div>


        <!-- Second Row: Room Layout and Main Control Panel -->
        <div class="row mt-4">
            <!-- Room Layout Section -->
            <div class="col-lg-8 section-container">
                <h3 class="section-title">Room Layout</h3>
                <div class="floorplan-container position-relative">
                    <div class="floorplan-image-container">
                        <img :src="floorplanImage" alt="Floorplan for B05-13/14" class="floorplan-image" />

                        <!-- Icons for devices (Main Pump, Dosage Pump, Planter Pots) -->
                        <div v-for="(icon, index) in icons" :key="index" class="icon-container"
                            :style="{ top: icon.y + '%', left: icon.x + '%', position: 'absolute', transform: 'translate(-50%, -50%)' }"
                            @click="openIconModal(icon)">
                            <img :src="icon.src" alt="Icon" class="icon-image" />
                            <div :class="['status-dot', icon.isOn ? 'online' : 'offline']"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Control Panel Section for Individual Valves and Pumps -->
            <div class="col-lg-4 section-container">
                <h3 class="section-title">Control Panel (ALL ON)</h3>
                <div class="console-box">
                    <!-- ALL ON/OFF Toggle -->
                    <div class="toggle-switch">
                        <input type="checkbox" id="allValvesToggle" v-model="areAllValvesOn" @change="toggleAllValves">
                        <label for="allValvesToggle">{{ areAllValvesOn ? 'ALL VALVES OFF' : 'ALL VALVES ON' }}</label>
                    </div>

                    <!-- Main Pump and Dosage Pump Toggles -->
                    <div class="toggle-switch">
                        <input type="checkbox" id="mainPumpToggle" v-model="isMainPumpOn" @change="toggleMainPump">
                        <label for="mainPumpToggle">Main Pump (Valve 1)</label>
                    </div>
                    <div class="toggle-switch">
                        <input type="checkbox" id="dosagePumpToggle" v-model="isDosagePumpOn"
                            @change="toggleDosagePump">
                        <label for="dosagePumpToggle">Dosage Pump (Valve 19)</label>
                    </div>
                </div>
                <h3 class="section-title">Control Panel (Individual)</h3>
                <div class="console-box">
                    <!-- Planter Pots Valves -->
                    <div class="valves-section">
                        <div class="toggle-switch" v-for="(icon, index) in icons.slice(2)" :key="index">
                            <input type="checkbox" :id="'valveToggle' + (icon.switchNumber - 1)" v-model="icon.isOn"
                                @change="toggleIndividualValve(icon.switchNumber)">
                            <label :for="'valveToggle' + (icon.switchNumber - 1)">{{ icon.name }} (Valve {{
                                icon.switchNumber }})</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showIconModal" class="modal-overlay" @click="closeIconModal"></div>
        <div v-if="showIconModal" class="modal d-block" style="z-index: 1050;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <h5 class="modal-title">{{ activeIcon ? activeIcon.name : 'Sensor' }}</h5>
                        <button type="button" class="btn-close position-absolute top-0 end-0"
                            @click="closeIconModal">&times;</button>
                    </div>
                    <div class="modal-body text-center">
                        <label class="switch">
                            <input type="checkbox" v-model="activeIcon.isOn"
                                @change="toggleSwitchInModal(activeIcon.isOn, activeIcon)" />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import mainPumpIcon from '@/assets/main-pump-icon.png';
import dosagePumpIcon from '@/assets/dosage-pump-icon.png';
import planterPotIcon from '@/assets/planter-pot-icon.png';

export default {
    data() {
        return {
            selectedSensorIndex: 0,  // This will store the index of the selected sensor
            currentSensor: {},  // This will store the data of the selected sensor
            sensorData: [],  // This will store all 17 sensors' data
            isMainPumpOn: false,
            areAllValvesOn: false,
            isDosagePumpOn: false,
            floorplanImage: require('@/assets/Sub System and Icons/V2/smart Landscape system_full.png'),
            icons: [
                { x: 90, y: 28, src: mainPumpIcon, name: 'Main Pump', switchNumber: 1, isOn: false },
                { x: 87.5, y: 20.6, src: dosagePumpIcon, name: 'Dosage Pump', switchNumber: 19, isOn: false },
                { x: 97, y: 35.5, src: planterPotIcon, name: 'Planter Pot 1', switchNumber: 2, isOn: false },
                { x: 94, y: 42.5, src: planterPotIcon, name: 'Planter Pot 2', switchNumber: 3, isOn: false },
                { x: 88, y: 56, src: planterPotIcon, name: 'Planter Pot 3', switchNumber: 4, isOn: false },
                { x: 88.5, y: 33, src: planterPotIcon, name: 'Planter Pot 4', switchNumber: 5, isOn: false },
                { x: 77, y: 50, src: planterPotIcon, name: 'Planter Pot 5', switchNumber: 6, isOn: false },
                { x: 76, y: 68, src: planterPotIcon, name: 'Planter Pot 6', switchNumber: 7, isOn: false },
                { x: 69.3, y: 70, src: planterPotIcon, name: 'Planter Pot 7', switchNumber: 8, isOn: false },
                { x: 28.5, y: 60, src: planterPotIcon, name: 'Planter Pot 8', switchNumber: 9, isOn: false },
                { x: 17.5, y: 40, src: planterPotIcon, name: 'Planter Pot 9', switchNumber: 10, isOn: false },
                { x: 18, y: 65, src: planterPotIcon, name: 'Planter Pot 10', switchNumber: 11, isOn: false },
                { x: 6.6, y: 68, src: planterPotIcon, name: 'Planter Pot 11', switchNumber: 12, isOn: false },
                { x: 7.4, y: 39.3, src: planterPotIcon, name: 'Planter Pot 12', switchNumber: 13, isOn: false },
                { x: 1.5, y: 32, src: planterPotIcon, name: 'Planter Pot 13', switchNumber: 14, isOn: false },
                { x: 19.5, y: 19.5, src: planterPotIcon, name: 'Planter Pot 14', switchNumber: 15, isOn: false },
                { x: 34, y: 22.3, src: planterPotIcon, name: 'Planter Pot 15', switchNumber: 16, isOn: false },
                { x: 56, y: 23, src: planterPotIcon, name: 'Planter Pot 16', switchNumber: 17, isOn: false },
                { x: 76.5, y: 23, src: planterPotIcon, name: 'Planter Pot 17', switchNumber: 18, isOn: false },
            ],
            showIconModal: false,
            activeIcon: null,
            switchStatesOutdoor1: Array(8).fill(false), // Valves 1-8
            switchStatesOutdoor2: Array(8).fill(false), // Valves 9-16
            switchStatesOutdoor3: Array(3).fill(false), // Valves 17-19

        };
    },
    methods: {
        updateSelectedSensor() {
            this.currentSensor = this.sensorData[this.selectedSensorIndex];
        },

        async fetchSensorData() {
            try {
                const response = await axios.get("https://hammerhead-app-kva7n.ondigitalocean.app/api/Lorawan/latest/outdoor");
                const data = response.data;

                // Storing relevant sensor data into the sensorData array
                let originalSensorData = [
                    data['aaaa202406140017'],
                    data['aaaa202406140009'],
                    data['aaaa202406140005'],
                    data['aaaa202406140006'],
                    data['aaaa202406140007'],
                    data['aaaa202406140008'],
                    data['aaaa202406140010'],
                    data['aaaa202406140011'],
                    data['aaaa202406140012'],
                    data['aaaa202406140015'],
                    data['aaaa202406140004'],
                    data['aaaa202406140001'],
                    data['aaaa202406140002'],
                ];

                // Randomly duplicate 4 sensors from the original 13 to make it 17
                const randomIndexes = [];
                while (randomIndexes.length < 4) {
                    const randomIndex = Math.floor(Math.random() * originalSensorData.length);
                    if (!randomIndexes.includes(randomIndex)) {
                        randomIndexes.push(randomIndex);
                    }
                }

                // Duplicating the randomly selected sensors
                const duplicatedSensors = randomIndexes.map(index => originalSensorData[index]);

                // Combine original sensor data with duplicated sensors
                this.sensorData = [...originalSensorData, ...duplicatedSensors];

                // Set the first sensor data as the default on load
                this.currentSensor = this.sensorData[0];

                console.log("Final sensorData array:", this.sensorData); // For debugging

            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        },
        getUnit(key) {
            const units = {
                co2: 'ppm',
                temperature: '°C',
                humidity: '%',
                pm2_5: 'µg/m³',
                pm10: 'µg/m³'
            };
            return units[key] || '';
        },
        getFaceClass(value, type) {
            let goodLimit, badLimit;

            switch (type) {
                case 'co2':
                    goodLimit = 1000;
                    badLimit = 1500;
                    break;
                case 'temperature':
                    goodLimit = 25.5; // Acceptable range is 22.5°C to 25.5°C
                    badLimit = 27.5;
                    break;
                case 'humidity':
                    goodLimit = 70; // Acceptable range is < 70%
                    badLimit = 71;
                    break;
                case 'pm2_5':
                    goodLimit = 35; // Acceptable range < 35 µg/m³
                    badLimit = 75;
                    break;
                case 'pm10':
                    goodLimit = 100; // Acceptable range < 100 µg/m³
                    badLimit = 150;
                    break;
                default:
                    goodLimit = 0;
                    badLimit = 0;
            }

            if (value < goodLimit) {
                return 'fas fa-smile modal-face-icon'; // Green smiley face for good values
            } else if (value >= goodLimit && value < badLimit) {
                return 'fas fa-meh text-warning modal-face-icon'; // Orange neutral face for moderate values
            } else {
                return 'fas fa-frown text-danger modal-face-icon'; // Red frown face for bad values
            }
        },
        toggleIndividualValve(switchNumber) {
            const deviceEUI = this.getDeviceEUI(switchNumber);
            let switchStates = this.getSwitchStates(deviceEUI);

            // Ensure the array exists and reset it to all `false` (0s) before updating the selected valve
            const index = switchNumber - 1; // Switch numbers start from 1
            if (deviceEUI === '24e124756e049516') {
                // Reset array for switches 9-16
                this.switchStatesOutdoor2 = Array(8).fill(false);
                this.switchStatesOutdoor2[switchNumber - 9] = this.icons.find(icon => icon.switchNumber === switchNumber).isOn;
                switchStates = this.switchStatesOutdoor2;
            } else {
                switchStates[index] = this.icons.find(icon => icon.switchNumber === switchNumber).isOn;
            }

            // Send the updated switch states
            this.sendSwitchCommand(deviceEUI, switchStates);

            console.log(switchStates.map(state => state ? 1 : 0)); // Debugging to see if the array is correct
        }
        ,
        getDeviceEUI(switchNumber) {
            if (switchNumber <= 8) return '24e124756e049564';   // Valves 1-8
            else if (switchNumber <= 16) return '24e124756e049516'; // Valves 9-16
            else return '24E124756E049454'; // Valves 17-19
        },
        getSwitchStates(deviceEUI) {
            if (deviceEUI === '24e124756e049564') return this.switchStatesOutdoor1;
            else if (deviceEUI === '24e124756e049516') return this.switchStatesOutdoor2;
            else return this.switchStatesOutdoor3;
        },
        async sendSwitchCommand(deviceEUI, switchStates) {
            const url = ``;
            console.log(switchStates.map(state => state ? 1 : 0));
            const payload = {
                deviceEui: deviceEUI,
                switchStates: switchStates.map(state => state ? 1 : 0), // Ensure switch states are correctly mapped
            };

            try {
                const response = await axios.post(url, payload);
                console.log('Switch command sent successfully:', response.data);
            } catch (error) {
                console.error('Error sending switch command:', error);
            }
        },
        toggleMainPump() {
            this.setAllSwitches(this.isMainPumpOn, '24e124756e049564', 1, 1);

            // Update `isOn` status for Main Pump
            const mainPumpIcon = this.icons.find(icon => icon.switchNumber === 1);
            if (mainPumpIcon) {
                mainPumpIcon.isOn = this.isMainPumpOn;
            }
        },
        toggleDosagePump() {
            this.setAllSwitches(this.isDosagePumpOn, '24E124756E049454', 19, 19);

            // Update `isOn` status for Dosage Pump
            const dosagePumpIcon = this.icons.find(icon => icon.switchNumber === 19);
            if (dosagePumpIcon) {
                dosagePumpIcon.isOn = this.isDosagePumpOn;
            }
        },
        toggleAllValves() {
            this.setAllSwitches(this.areAllValvesOn, '24e124756e049564', 2, 8);
            this.setAllSwitches(this.areAllValvesOn, '24e124756e049516', 9, 16);
            this.setAllSwitches(this.areAllValvesOn, '24E124756E049454', 17, 19);

            // Update `isOn` status for each valve in icons
            this.icons.forEach(icon => {
                if (icon.switchNumber !== 1 && icon.switchNumber !== 19) {
                    icon.isOn = this.areAllValvesOn;
                }
            });
        },
        setAllSwitches(state, deviceEUI, startSwitch, endSwitch) {
            let switchStates = [];

            if (deviceEUI === '24e124756e049564') {
                // Update for switches 1-8
                this.switchStatesOutdoor1 = this.switchStatesOutdoor1.map((_, index) =>
                    index + 1 >= startSwitch && index + 1 <= endSwitch ? state : this.switchStatesOutdoor1[index]
                );
                switchStates = this.switchStatesOutdoor1;
            } else if (deviceEUI === '24e124756e049516') {
                // Update for switches 9-16
                this.switchStatesOutdoor2 = this.switchStatesOutdoor2.map((_, index) =>
                    index + 9 >= startSwitch && index + 9 <= endSwitch ? state : this.switchStatesOutdoor2[index]
                );
                switchStates = this.switchStatesOutdoor2;
            } else if (deviceEUI === '24E124756E049454') {
                // Update for switches 17-19
                this.switchStatesOutdoor3 = this.switchStatesOutdoor3.map((_, index) =>
                    index + 17 >= startSwitch && index + 17 <= endSwitch ? state : this.switchStatesOutdoor3[index]
                );
                switchStates = this.switchStatesOutdoor3;
            }

            console.log(switchStates.map(state => state ? 1 : 0)); // Debugging to see the final switch states array

            // Send the switch command, ensuring the array is correctly sized
            this.sendSwitchCommand(deviceEUI, switchStates);
        },
        toggleSwitchInModal(state, icon) {
            icon.isOn = state; // Toggle the state of the icon in the modal

            let switchStates;
            let deviceEUI;

            if (icon.switchNumber <= 8) {
                deviceEUI = '24e124756e049564';
                this.switchStatesOutdoor1[icon.switchNumber - 1] = state;
                switchStates = this.switchStatesOutdoor1;
            } else if (icon.switchNumber <= 16) {
                deviceEUI = '24e124756e049516';
                this.switchStatesOutdoor2[icon.switchNumber - 9] = state;
                switchStates = this.switchStatesOutdoor2;
            } else if (icon.switchNumber <= 19) {
                deviceEUI = '24E124756E049454';
                this.switchStatesOutdoor3[icon.switchNumber - 17] = state;
                switchStates = this.switchStatesOutdoor3;
            }

            this.sendSwitchCommand(deviceEUI, switchStates);
            console.log(`Switch ${icon.switchNumber} toggled to ${state ? 'ON' : 'OFF'}`);

            // Sync status in relationPoints
            this.relationPoints.forEach((point) => {
                if (point.type === 'Valve' && point.label === icon.switchNumber.toString()) {
                    point.status = state ? 'On' : 'Off';
                }
            });

            this.closeIconModal(); // Close the modal after toggling the switch
        },
    },
    mounted() {
        this.fetchSensorData();
    }
};
</script>

<style scoped>
.container {
    width: 100%;
    padding: 20px;
}

.text-center {
    text-align: center;
}

.section-container {
    margin-bottom: 30px;
}

.section-title {
    text-align: center;
    margin-bottom: 20px;
    color: white;
    font-weight: bold;
}

.sensor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.sensor-box {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 15px;
    text-align: center;
}

.face-indicator {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.face-icon {
    font-size: 1.5rem;
}

.floorplan-container {
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
}

.floorplan-image-container {
    width: 100%;
    height: auto;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 10px;
    display: flex;
    justify-content: center;
}

.floorplan-image {
    width: 100%;
    border-radius: 5px;
}

.chart-box,
.console-box {
    border-radius: 5px;
    padding: 15px;
    text-align: center;
}

.chart-box {
    height: 300px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}

.text-success {
    color: green;
}

.text-danger {
    color: red;
}

.row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.section-container {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 20px;
    margin-bottom: 30px;
    flex: 1;
}

.toggle-switch {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.toggle-switch input[type="checkbox"] {
    width: 40px;
    height: 20px;
    appearance: none;
    background: #ddd;
    border-radius: 20px;
    position: relative;
    outline: none;
    cursor: pointer;
    transition: background 0.3s ease;
}

.toggle-switch input[type="checkbox"]:checked {
    background: green;
}

.toggle-switch input[type="checkbox"]:before {
    content: "";
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: transform 0.3s ease;
}

.toggle-switch input[type="checkbox"]:checked:before {
    transform: translateX(20px);
}

.toggle-switch label {
    margin-left: 10px;
    font-size: 1rem;
    cursor: pointer;
}

.icon-container {
    position: relative;
}

.icon-image {
    width: 24px;
    height: 24px;
    visibility: hidden;
}

.status-dot {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.online {
    background-color: green;
}

.offline {
    background-color: red;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}

.modal.d-block {
    display: block;
}

.modal-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    color: black;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1050;
    width: 500px;
}

.modal-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.modal-header .btn-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: green;
}

input:checked+.slider:before {
    transform: translateX(26px);
}

.valves-section {
    margin-top: 20px;
}

@media (min-width: 1400px) {

    .container,
    .container-lg,
    .container-md,
    .container-sm,
    .container-xl,
    .container-xxl {
        max-width: 99%;
    }
}

.fas.fa-smile {
    color: #90ee90;
    /* Light green */
}
</style>
