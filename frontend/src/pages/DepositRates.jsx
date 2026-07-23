import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function DepositRates() {

  const [rates, setRates] = useState([]);

  const [formData, setFormData] = useState({
    fromYear: "",
    fromMonth: "",
    toYear: "",
    toMonth: "",
    monthlyAmount: "",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/deposit-rates"
      );

      setRates(res.data);

    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveRate = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/deposit-rates",
        formData
      );

      alert("✅ Deposit Rate Added Successfully");

      setFormData({
        fromYear: "",
        fromMonth: "",
        toYear: "",
        toMonth: "",
        monthlyAmount: "",
      });

      fetchRates();

    } catch (error) {
      console.log(error);
      alert("Failed to Save Deposit Rate");
    }
  };

  return (
    <MainLayout>

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Deposit Rate Management
        </h1>

        <div className="grid md:grid-cols-5 gap-4">

          <input
            type="number"
            name="fromYear"
            placeholder="From Year"
            value={formData.fromYear}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="fromMonth"
            placeholder="From Month"
            value={formData.fromMonth}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="toYear"
            placeholder="To Year"
            value={formData.toYear}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="toMonth"
            placeholder="To Month"
            value={formData.toMonth}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="monthlyAmount"
            placeholder="Monthly Amount"
            value={formData.monthlyAmount}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

        </div>

        <button
          onClick={saveRate}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Save Deposit Rate
        </button>
        <div className="mt-8 overflow-x-auto">

          <table className="w-full border">

            <thead className="bg-blue-600 text-white">

              <tr>
                <th className="p-3 border">From</th>
                <th className="p-3 border">To</th>
                <th className="p-3 border">Monthly Deposit</th>
              </tr>

            </thead>

            <tbody>

              {rates.length === 0 ? (

                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-6"
                  >
                    No Deposit Rate Found
                  </td>
                </tr>

              ) : (

                rates.map((rate) => (

                  <tr
                    key={rate._id}
                    className="hover:bg-gray-100"
                  >

                    <td className="border p-3">
                      {rate.fromMonth}/{rate.fromYear}
                    </td>

                    <td className="border p-3">
                      {rate.toMonth}/{rate.toYear}
                    </td>

                    <td className="border p-3 font-semibold text-green-600">
                      ৳ {Number(rate.monthlyAmount).toLocaleString()}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>
  );
}

export default DepositRates;