import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';


const LandingPage = () => {
  return (
    <div>
      <div id="header">
        <h1>Welcome to EtherEngine!</h1>
        <h2>Next-Generation Distributed Computing & Storage Platform</h2>
        <p>Revolutionize your data processing with EtherEngine</p>

        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
      </div>

      <div id="content">
        <h3>EtherEngine is a cutting-edge platform that leverages Bacalhau's distributed computing architecture to process vast amounts of data securely and efficiently. Bacalhau enables us to run your computation tasks wherever your data is stored, reducing costs and boosting performance.</h3>

        <h3>Effortless Deployment with FVM</h3>
        <p>With FVM (Flutter Version Management), managing multiple versions of Flutter SDK is no longer a hassle. It ensures consistent app builds by referencing the Flutter SDK version used on a per-project basis, leading to a smoother, more efficient development process.</p>

        <h3>Trustless Security with Lit Protocol</h3>
        <p>Lit Protocol forms the backbone of our security infrastructure, providing distributed cryptographic key management. With Lit, your data is always safe, encrypted based on set conditions, and decrypted only when these conditions are met.</p>

        <h3>Global Storage Network with Filecoin</h3>
        <p>In collaboration with Filecoin, EtherEngine lets you tap into a global, decentralized storage network. Whether you're storing or retrieving data, Filecoin ensures reliable, continuous service tailored to your needs.</p>

        <h2>How EtherEngine Works</h2>
        <ol>
          <li>Submit Your Task: Use our intuitive UI to submit your computation task. You can define the specifications of the job and set your bid.</li>
          <li>Data Ingestion: EtherEngine ingests your data and prepares it for processing. You can upload your data directly or provide a link from where EtherEngine can fetch it.</li>
          <li>Task Execution: EtherEngine executes your computation task securely and efficiently, thanks to Bacalhau's Compute Over Data architecture.</li>
          <li>Monitor Progress: Keep track of your task's progress in real-time from the dashboard. View all your active tasks, completed tasks, and the results of your computations.</li>
          <li>Retrieve Your Results: Once your task is complete, you can easily retrieve the results straight from your dashboard.</li>
        </ol>

        <h2>Join EtherEngine Today</h2>
        <p>Join us today and experience the future of distributed computing and storage. Whether you're a data scientist, researcher, or developer, EtherEngine is designed to make your work easier, faster, and more efficient.</p>
        <p>EtherEngine - Making Distributed Computing and Storage Accessible to Everyone</p>

        <h2>Why Choose EtherEngine</h2>
        <ul>
          <li>Cost-Efficient and Fast: Our use of Bacalhau's Compute Over Data architecture eliminates the need for expensive data transfers by running computations where the data is stored. This, combined with the parallel processing power of Bacalhau, allows us to process vast amounts of data quickly and cost-effectively.</li>
          <li>Secure and Reliable: With Lit Protocol, we provide robust, decentralized cryptographic key management for secure data encryption and signing. No need to worry about unauthorized access to your sensitive data.</li>
          <li>Flexible and Scalable: Whether you're processing terabytes or petabytes of data, EtherEngine can handle it. Our platform scales seamlessly with your data, ensuring you always have enough resources for your computing needs.</li>
          <li>Multi-Cloud and Edge Compatible: EtherEngine is built to work across different regions, clouds, and edge devices, offering you unparalleled flexibility in managing your computation tasks.</li>
        </ul>

        <h2>Use Cases</h2>
        <p>EtherEngine is a versatile platform that can be used in a wide range of industries and for various purposes. Here are some examples:</p>
        <ul>
          <li>Machine Learning: Use EtherEngine to train machine learning models on large datasets without worrying about infrastructure or scalability issues.</li>
          <li>Data Analytics: Analyze large datasets quickly and cost-effectively with EtherEngine's distributed computing capabilities.</li>
          <li>Scientific Computing: Perform complex computations for scientific research at scale with EtherEngine.</li>
          <li>Data-Intensive Applications: EtherEngine is perfect for any application that involves processing large amounts of data, including data engineering, model training, and inference.</li>
        </ul>

        <h2>Get Started with EtherEngine</h2>
        <p>Are you ready to take your data processing to the next level? Sign up for EtherEngine today and experience the future of distributed computing and storage.</p>
        <p>EtherEngine - Your Gateway to Efficient, Secure, and Scalable Data Processing</p>
      </div>


    </div>
  );
};

export default LandingPage;
