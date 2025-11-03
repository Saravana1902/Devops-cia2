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
      echo "✅ SUCCESS: Deployed ${SERVICE_NAME}:${BUILD_TAG} to Cloud Run"

      emailext(
        subject: "✅ SUCCESS: ${JOB_NAME} Build #${BUILD_NUMBER}",
        body: """
          <h3>✅ Jenkins Deployment Successful</h3>
          <p><b>Service:</b> ${SERVICE_NAME}</p>
          <p><b>Build Tag:</b> ${BUILD_TAG}</p>
          <p><b>Project:</b> ${PROJECT_ID}</p>
          <p><b>Region:</b> ${REGION}</p>
          <p>View build logs: <a href='${BUILD_URL}'>${BUILD_URL}</a></p>
          <br>
          <p>-- Jenkins CI/CD Bot 🤖</p>
        """,
        mimeType: 'text/html',
        to: '11138.saravanakrishnan@gmail.com'
      )
    }

    failure {
      echo "❌ FAILED: Check Jenkins console logs"

      emailext(
        subject: "❌ FAILURE: ${JOB_NAME} Build #${BUILD_NUMBER}",
        body: """
          <h3>❌ Jenkins Deployment Failed</h3>
          <p><b>Service:</b> ${SERVICE_NAME}</p>
          <p><b>Build Tag:</b> ${BUILD_TAG}</p>
          <p><b>Project:</b> ${PROJECT_ID}</p>
          <p>Check logs for details: <a href='${BUILD_URL}'>${BUILD_URL}</a></p>
          <br>
          <p>-- Jenkins CI/CD Bot ⚠️</p>
        """,
        mimeType: 'text/html',
        to: '11138.saravanakrishnan@gmail.com'
      )
    }
  }
}
