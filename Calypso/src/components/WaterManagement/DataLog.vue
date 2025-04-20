<template>
    <div class="data-log-container">
        <h2 class="text-center">Device Consumption Data</h2>

        <!-- Options Bar -->
        <div class="options-bar">
            <div class="option">
                <label for="location-sort">Sort Location:</label>
                <select id="location-sort" v-model="selectedLocation">
                    <option value="">All Locations</option>
                    <option v-for="loc in uniqueLocations" :key="loc" :value="loc">{{ loc }}</option>
                </select>
            </div>
            <div class="option">
                <label for="power-usage-sort">Sort Most Power Usage Over:</label>
                <select id="power-usage-sort" v-model="powerUsageSortPeriod">
                    <option value="all">All</option>
                    <option value="daily">Day</option>
                    <option value="monthly">Month</option>
                </select>
            </div>
        </div>

        <!-- Data Table -->
        <div class="table-container">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Dev EUI</th>
                        <th>Description</th>
                        <th v-if="powerUsageSortPeriod === 'all'">Total Consumption (m³)</th>
                        <th v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'daily'">Daily Consumption (m³)</th>
                        <th v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'monthly'">Monthly Consumption (m³)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="device in allSortedDevices" :key="device.id">
                        <td>{{ device.device_name }}</td>
                        <td>{{ device.dev_eui || 'N/A' }}</td>
                        <td>{{ device.category || getCategory(device) }}</td>
                        <td v-if="powerUsageSortPeriod === 'all'">{{ device.totalConsumption }} m³</td>
                        <td v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'daily'">{{ device.dailyConsumption }} m³</td>
                        <td v-if="powerUsageSortPeriod === 'all' || powerUsageSortPeriod === 'monthly'">{{ device.monthlyConsumption }} m³</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- New Device Fault Log Table -->
        <div class="device-fault-log-container" v-if="faultDevices.length">
            <h2 class="text-center">Device Fault Log</h2>
            <div class="table-container">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Device</th>
                            <th>Dev EUI</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="device in faultDevices" :key="device.id">
                            <td>{{ device.device_name }}</td>
                            <td>{{ device.dev_eui }}</td>
                            <td>{{ device.category || getCategory(device) }}</td>
                            <td class="fault-text">Fault</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: 'DataLog',
    data() {
        return {
            selectedLocation: '',
            powerUsageSortPeriod: 'all',
            devices: [],
            categorizedDevices: {
                'Category A': [
                    { id: 1, dev_eui: '8254812403000465', device_name: 'Meter 1' },
                    { id: 2, dev_eui: '8254812403000462', device_name: 'Meter 2' },
                    { id: 3, dev_eui: '8254812403000482', device_name: 'Meter 3' },
                    { id: 4, dev_eui: '8254812403000447', device_name: 'Meter 4' },
                    { id: 5, dev_eui: '8254812403000653', device_name: 'Meter 5' }
                ],
                'Category B-A': [
                    { id: 6, dev_eui: '8254812403000643', device_name: 'Meter A' },
                    { id: 7, dev_eui: '8254812312000003', device_name: 'Meter B' },
                    { id: 12, dev_eui: '8254812403000644', device_name: 'Meter C' },
                ],
                'Category B-B': [
                    { id: 8, dev_eui: '8254812403000652', device_name: 'Meter D' },
                    { id: 9, dev_eui: '8254812312000004', device_name: 'Meter E' },
                    { id: 18, dev_eui: '8254812403000659', device_name: 'Meter F' },
                    { id: 28, dev_eui: '8254812307000002', device_name: 'Meter G' },
                    { id: 25, dev_eui: '8254812211000169', device_name: 'Meter H' }
                ],
            }
        };
    },
    computed: {
        faultDevices() {
            const EUIs = ['8254812307000003','8254812211000171','8254812211000172'];
            return this.devices.filter(d => !EUIs.includes(d.dev_eui) &&
                parseFloat(d.totalConsumption) === 0 &&
                parseFloat(d.dailyConsumption) === 0 &&
                parseFloat(d.monthlyConsumption) === 0
            );
        },
        uniqueLocations() {
            const EUIs = ['8254812307000003','8254812211000171','8254812211000172'];
            return [...new Set(
                this.devices.map(d => EUIs.includes(d.dev_eui)
                    ? 'WM01- Main Pipe Incoming PUB'
                    : d.device_name)
            )];
        },
        filteredDevices() {
            if (!this.selectedLocation) return this.devices;
            return this.devices.filter(d => {
                const loc = ['8254812307000003','8254812211000171','8254812211000172'].includes(d.dev_eui)
                    ? 'WM01- Main Pipe Incoming PUB'
                    : d.device_name;
                return loc === this.selectedLocation;
            });
        },
        combinedMain6() {
            const EUIs = ['8254812307000003','8254812211000171','8254812211000172'];
            const group = this.devices.filter(d => EUIs.includes(d.dev_eui));
            if (!group.length) return null;
            const sum = arr => arr.reduce((s,v) => s + parseFloat(v||0), 0);
            return {
                device_name: 'WM01- Main Pipe Incoming PUB',
                totalConsumption: sum(group.map(d=>d.totalConsumption)).toFixed(2),
                dailyConsumption: sum(group.map(d=>d.dailyConsumption)).toFixed(2),
                monthlyConsumption: sum(group.map(d=>d.monthlyConsumption)).toFixed(2)
            };
        },
        totalWaterConsumption() {
            return this.devices.reduce((s,d) => s + parseFloat(d.totalConsumption||0), 0).toFixed(2);
        },
        totalDailyConsumption() {
            return this.devices.reduce((s,d) => s + parseFloat(d.dailyConsumption||0), 0).toFixed(2);
        },
        totalMonthlyConsumption() {
            return this.devices.reduce((s,d) => s + parseFloat(d.monthlyConsumption||0), 0).toFixed(2);
        },
        allSortedDevices() {
            let arr = [];
            if ((!this.selectedLocation || this.selectedLocation === 'WM01- Main Pipe Incoming PUB') && this.combinedMain6) {
                arr.push({
                    id: 'combined',
                    device_name: this.combinedMain6.device_name,
                    dev_eui: '8254812211000172',
                    category: 'Other Devices',
                    totalConsumption: this.combinedMain6.totalConsumption,
                    dailyConsumption: this.combinedMain6.dailyConsumption,
                    monthlyConsumption: this.combinedMain6.monthlyConsumption
                });
            }
            const faultEUIs = this.faultDevices.map(d=>d.dev_eui);
            arr = arr.concat(
                this.filteredDevices.filter(d=> !['8254812307000003','8254812211000171','8254812211000172'].includes(d.dev_eui) && !faultEUIs.includes(d.dev_eui))
            );
            const key = this.powerUsageSortPeriod==='daily'?'dailyConsumption':
                        this.powerUsageSortPeriod==='monthly'?'monthlyConsumption':'totalConsumption';
            return arr.sort((a,b)=>parseFloat(b[key]) - parseFloat(a[key]));
        }
    },
    methods: {
        getCategory(device) {
            for (const [cat, list] of Object.entries(this.categorizedDevices)) {
                if (list.some(d=>d.dev_eui===device.dev_eui)) return cat;
            }
            return 'Unknown';
        },
        fetchDevicesData() {
            this.devices = Object.values(this.categorizedDevices).flat();
            // Hardcoded consumption values:
            this.devices.forEach((d,i) => {
                d.totalConsumption   = (100   + i*10).toFixed(2);
                d.dailyConsumption   = (10    + i*1).toFixed(2);
                d.monthlyConsumption = (50    + i*5).toFixed(2);
            });
        }
    },
    mounted() {
        this.fetchDevicesData();
    }
};
</script>

<style scoped>
.data-log-container { padding: 20px; margin: 0 auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;     padding-top: 5%;}
.text-center { text-align: center; }
.table-container { margin-bottom: 20px; }
.table { width: 100%; border-collapse: collapse; }
.table th,
.table td { text-align: left; padding: 10px; border: 1px solid #ddd; }
.table th { background-color: #f1f1f1; font-weight: bold; }
.table tbody tr:nth-child(even) { background-color: #f9f9f9; }
.options-bar { display: flex; justify-content: space-between; align-items: center; background-color: #f4f4f4; padding: 10px 20px; margin-bottom: 20px; border-radius: 5px; border: 1px solid #ddd; }
.option { display: flex; align-items: center; gap: 10px; }
.fault-text { color: red; font-weight: bold; }
</style>