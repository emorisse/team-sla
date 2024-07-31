import React, { useState } from 'react';

const factorial = (n: number): number => {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
};

const TeamWorkloadCalculator: React.FC = () => {
  const [workItemsPerMonth, setWorkItemsPerMonth] = useState<number>(100);
  const [itemsPerPersonPerMonth, setItemsPerPersonPerMonth] = useState<number>(17);
  const [teamSize, setTeamSize] = useState<number>(6);

  // Convert monthly rates to daily rates (assuming 22 working days per month)
  const workItemsPerDay = workItemsPerMonth / 22;
  const itemsPerPersonPerDay = itemsPerPersonPerMonth / 22;

  // Calculate queue metrics
  const utilization = workItemsPerDay / (teamSize * itemsPerPersonPerDay);
  
  let p0 = 0;
  let avgQueueLength = 0;
  let avgWaitTime = 0;
  let avgTotalItems = 0;
  let avgTotalTime = 0;
  let queueGrowthRate = 0;
  
  if (utilization < 1) {
    p0 = 1 / (
      Array.from({ length: teamSize }, (_, i) => Math.pow(workItemsPerDay / itemsPerPersonPerDay, i) / factorial(i)).reduce((a, b) => a + b, 0) +
      (Math.pow(workItemsPerDay / itemsPerPersonPerDay, teamSize) / factorial(teamSize)) * (1 / (1 - utilization))
    );
    avgQueueLength = (p0 * Math.pow(workItemsPerDay / itemsPerPersonPerDay, teamSize) * utilization) / (factorial(teamSize) * Math.pow(1 - utilization, 2));
    avgWaitTime = avgQueueLength / workItemsPerDay;
    avgTotalItems = avgQueueLength + workItemsPerDay / itemsPerPersonPerDay;
    avgTotalTime = avgWaitTime + 1 / itemsPerPersonPerDay;
  } else {
    // Calculate the rate at which the queue is growing
    queueGrowthRate = workItemsPerDay - (teamSize * itemsPerPersonPerDay);
  }

  // Convert times to hours and days
  const avgWaitTimeHours = avgWaitTime * 24;
  const avgWaitTimeDays = avgWaitTime;
  const avgTotalTimeHours = avgTotalTime * 24;
  const avgTotalTimeDays = avgTotalTime;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Team Workload and SLA Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Team Information</h2>
          <p className="text-gray-600 mb-6">Enter your team's workload and capacity</p>
          <div className="space-y-6">
            <div>
              <label htmlFor="workItemsPerMonth" className="block text-sm font-medium text-gray-700 mb-1">Work Items per Month</label>
              <input
                id="workItemsPerMonth"
                type="number"
                value={workItemsPerMonth}
                onChange={(e) => setWorkItemsPerMonth(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="itemsPerPersonPerMonth" className="block text-sm font-medium text-gray-700 mb-1">Items per Person per Month</label>
              <input
                id="itemsPerPersonPerMonth"
                type="number"
                value={itemsPerPersonPerMonth}
                onChange={(e) => setItemsPerPersonPerMonth(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
              <input
                id="teamSize"
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <p className="text-gray-600 mb-6">Estimated workload metrics</p>
          <div className="space-y-4">
            <p><strong>Team Utilization:</strong> {(utilization * 100).toFixed(1)}%</p>
            {utilization >= 1 ? (
              <div className="text-red-600 font-semibold">
                <p>Warning: Team is overutilized!</p>
                <p>The queue is growing by approximately {queueGrowthRate.toFixed(2)} items per day.</p>
                <p>Wait times and queue length will increase indefinitely if this continues.</p>
              </div>
            ) : (
              <>
                <p><strong>Average Queue Length:</strong> {avgQueueLength.toFixed(1)} items</p>
                <p><strong>Average Total Items in System:</strong> {avgTotalItems.toFixed(1)} items</p>
                <p><strong>Average Wait Time:</strong> {avgWaitTimeHours.toFixed(1)} hours ({avgWaitTimeDays.toFixed(1)} days)</p>
                <p><strong>Average Total Time in System:</strong> {avgTotalTimeHours.toFixed(1)} hours ({avgTotalTimeDays.toFixed(1)} days)</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">SLA Recommendations</h3>
              <div className="mt-2 text-sm text-blue-700">
                {utilization >= 1 ? (
                  <p>Unable to provide SLA recommendations. The team is overutilized and the backlog will continue to grow. Consider increasing team size or reducing incoming workload.</p>
                ) : (
                  <>
                    <p>Based on the results, consider setting your SLA for task completion to:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Standard SLA: {Math.ceil(avgTotalTimeDays)} business days</li>
                      <li>Expedited SLA: {Math.ceil(avgTotalTimeDays / 2)} business days</li>
                    </ul>
                    <p className="mt-2">These SLAs account for both waiting time and processing time. Adjust based on your team's specific needs and priorities.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Understanding the Results</h2>
          <div className="space-y-4">
            <p><strong>Team Utilization:</strong> The percentage of time your team is actively working on tasks. High utilization (%gt;80%) may lead to burnout and longer wait times. If utilization is 100% or higher, the team cannot keep up with incoming work.</p>
            <p><strong>Average Queue Length:</strong> The typical number of work items waiting to be started.</p>
            <p><strong>Average Total Items in System:</strong> The total number of work items, including those waiting and those being worked on.</p>
            <p><strong>Average Wait Time:</strong> How long a new work item typically waits before someone starts working on it.</p>
            <p><strong>Average Total Time in System:</strong> The total time from when a work item arrives to when it's completed, including both wait time and processing time.</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tips for Improving Efficiency</h2>
          <div className="space-y-4">
            <p>1. <strong>Increase team size:</strong> If utilization is high or over 100%, consider adding more team members to reduce wait times and prevent burnout.</p>
            <p>2. <strong>Improve productivity:</strong> Provide training or tools to help team members complete more items per month.</p>
            <p>3. <strong>Manage incoming work:</strong> If possible, try to smooth out the flow of incoming work to prevent sudden spikes. If consistently overloaded, find ways to reduce the incoming workload.</p>
            <p>4. <strong>Prioritize effectively:</strong> Use a clear system to prioritize work items and ensure the most important tasks are completed first.</p>
            <p>5. <strong>Regular reviews:</strong> Periodically review these metrics and adjust your processes or team size as needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamWorkloadCalculator;