pipeline {
  agent any

  environment {
    PROJECT_ID = 'ci-cd-demo-477012'
    REGION = 'asia-south1'
    REPO = 'my-docker-repo'
    SERVICE_NAME = 'my-web-app'
    IMAGE_NAME = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE_NAME}"
    GCP_SA_CRED_ID = 'gcp-sa-key'
    BUILD_TAG = "${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies & Test') {
      steps {
        sh 'node -v || true'
        sh 'npm install || true'
        sh 'npm test || true'
      }
    }

    stage('Build Docker image') {
      steps {
        sh "docker build -t ${SERVICE_NAME}:${BUILD_TAG} ."
      }
    }

    stage('Push to Artifact Registry') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "🔑 Activating service account..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}
            gcloud auth configure-docker ${REGION}-docker.pkg.dev -q

            echo "📦 Tagging and pushing image..."
            docker tag ${SERVICE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:${BUILD_TAG}
            docker push ${IMAGE_NAME}:${BUILD_TAG}
          '''
        }
      }
    }

    stage('Verify GCP Auth') {
      steps {
        sh 'gcloud auth list'
      }
    }

    stage('Deploy to Cloud Run') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "🚀 Deploying to Cloud Run..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}

            gcloud run deploy ${SERVICE_NAME} \
              --image=${IMAGE_NAME}:${BUILD_TAG} \
              --region=${REGION} \
              --platform=managed \
              --allow-unauthenticated \
              --quiet

            echo "✅ Cloud Run deployment complete."
          '''
        }
      }
    }

    stage('Enable Monitoring & Logging') {
      steps {
        withCredentials([file(credentialsId: "${GCP_SA_CRED_ID}", variable: 'GCP_KEY')]) {
          sh '''
            echo "📊 Enabling Cloud Monitoring and Logging..."
            gcloud auth activate-service-account --key-file=$GCP_KEY
            gcloud config set project ${PROJECT_ID}

            gcloud services enable monitoring.googleapis.com logging.googleapis.com
            gcloud logging sinks list
            gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit=5 --format="value(textPayload)"
          '''
        }
      }
    }
  }

  post {
    success {
      script {
        def startTime = new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss")
        def endTime = new Date().format("yyyy-MM-dd HH:mm:ss")
        def duration = currentBuild.durationString.replace(' and counting', '')
        
        echo "✅ SUCCESS: Deployed ${SERVICE_NAME}:${BUILD_TAG} to Cloud Run"

        emailext(
          subject: "✅ SUCCESS: ${JOB_NAME} - Build #${BUILD_NUMBER}",
          body: """
            <html>
            <body style="font-family:Arial, sans-serif;">
              <h2 style="color:green;">✅ Build Success!</h2>
              <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:85%;">
                <tr><th align="left">Pipeline:</th><td>${JOB_NAME}</td></tr>
                <tr><th align="left">Build Number:</th><td>${BUILD_NUMBER}</td></tr>
                <tr><th align="left">Status:</th><td style="color:green;"><b>SUCCESS</b></td></tr>
                <tr><th align="left">Start Time:</th><td>${startTime}</td></tr>
                <tr><th align="left">End Time:</th><td>${endTime}</td></tr>
                <tr><th align="left">Duration:</th><td>${duration}</td></tr>
                <tr><th align="left">Git Commit:</th><td>${GIT_COMMIT}</td></tr>
                <tr><th align="left">Commit Message:</th><td>${GIT_COMMIT_MESSAGE}</td></tr>
                <tr><th align="left">Image Tag:</th><td>${BUILD_TAG}</td></tr>
                <tr><th align="left">Deployment URL:</th>
                  <td><a href="https://my-web-app-71806262503.asia-south1.run.app" target="_blank">
                  https://my-web-app-71806262503.asia-south1.run.app</a></td>
                </tr>
              </table>
              <br>
              <p><b>Console Output:</b> <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
              <p><b>Jenkins Build:</b> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
              <br>
              <p style="color:gray;">-- Jenkins CI/CD Bot 🤖</p>
            </body>
            </html>
          """,
          mimeType: 'text/html',
          to: '11138.saravanakrishnan@gmail.com'
        )
      }
    }

    failure {
      script {
        def startTime = new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd HH:mm:ss")
        def endTime = new Date().format("yyyy-MM-dd HH:mm:ss")
        def duration = currentBuild.durationString.replace(' and counting', '')

        echo "❌ FAILED: Check Jenkins console logs"

        emailext(
          subject: "❌ FAILURE: ${JOB_NAME} - Build #${BUILD_NUMBER}",
          body: """
            <html>
            <body style="font-family:Arial, sans-serif;">
              <h2 style="color:red;">❌ Build Failed</h2>
              <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:85%;">
                <tr><th align="left">Pipeline:</th><td>${JOB_NAME}</td></tr>
                <tr><th align="left">Build Number:</th><td>${BUILD_NUMBER}</td></tr>
                <tr><th align="left">Status:</th><td style="color:red;"><b>FAILED</b></td></tr>
                <tr><th align="left">Start Time:</th><td>${startTime}</td></tr>
                <tr><th align="left">End Time:</th><td>${endTime}</td></tr>
                <tr><th align="left">Duration:</th><td>${duration}</td></tr>
                <tr><th align="left">Image Tag:</th><td>${BUILD_TAG}</td></tr>
                <tr><th align="left">Project:</th><td>${PROJECT_ID}</td></tr>
                <tr><th align="left">Region:</th><td>${REGION}</td></tr>
              </table>
              <br>
              <p><b>Check Logs:</b> <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
              <p><b>Jenkins Build:</b> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
              <br>
              <p style="color:gray;">-- Jenkins CI/CD Bot ⚠️</p>
            </body>
            </html>
          """,
          mimeType: 'text/html',
          to: '11138.saravanakrishnan@gmail.com'
        )
      }
    }
  }
}
